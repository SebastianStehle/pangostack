import { NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { activityInfo, heartbeat } from '@temporalio/activity';
import { concatMap, lastValueFrom } from 'rxjs';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUpdateStepEntity,
  DeploymentUpdateStepRepository,
  DeploymentUpdateSubStepEntity,
  DeploymentUpdateSubStepRepository,
} from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { getEvaluationContext, getResourceUniqueId, updateContext } from 'src/domain/services';
import { ResourceApplyStreamRequest, ResourceEventDto, WorkerResolver } from 'src/domain/workers';
import { Activity } from '../registration';

const RESOURCE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export type DeployResourceParam = {
  deploymentId: number;
  resourceId: string;
  stepId?: number | null;
  updateId: number;
  workerEndpoint?: string;
};

@Activity(deployResource)
export class DeployResourceActivity implements Activity<DeployResourceParam> {
  private readonly logger = new Logger(DeployResourceActivity.name);

  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentUpdateStepEntity)
    private readonly deploymentSteps: DeploymentUpdateStepRepository,
    @InjectRepository(DeploymentUpdateSubStepEntity)
    private readonly deploymentSubSteps: DeploymentUpdateSubStepRepository,
    private readonly workerResolver: WorkerResolver,
  ) {}

  async execute({ deploymentId, resourceId, stepId, updateId, workerEndpoint }: DeployResourceParam) {
    const update = await this.deploymentUpdates.findOne({ where: { id: updateId }, relations: ['serviceVersion'] });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    const resource = update.serviceVersion.definition.resources.find((x) => x.id === resourceId);
    if (!resource) {
      throw new NotFoundException(`Deployment Update ${updateId} does not contain resource ${resourceId}.`);
    }

    if (!workerEndpoint) {
      throw new NotFoundException(`No worker registered for resource '${resource.type}'.`);
    }

    const step = await this.startStep(stepId);

    const { context } = getEvaluationContext(update);
    const client = await this.workerResolver.clientForEndpoint(workerEndpoint);

    const resourceUniqueId = getResourceUniqueId(deploymentId, resource);
    const resourceParams = evaluateParameters(resource, context);

    this.logger.log(`Deploying resource ${resource.id} for deployment ${deploymentId}`, {
      context: update.context,
      deploymentId,
      env: update.environment,
      parameters: resourceParams,
      parametersRaw: resource.parameters,
      resourceUniqueId,
    });

    const request: ResourceApplyStreamRequest = {
      resourceContext: update.resourceContexts[resource.id] || {},
      resourceUniqueId,
      resourceType: resource.type,
      parameters: resourceParams,
      timeoutMs: RESOURCE_TIMEOUT_MS,
    };

    this.logger.log({
      message: 'Sending request to worker',
      request,
      context: 'WorkerService',
    });

    // Everything the worker produces now arrives incrementally as events. We accumulate it and
    // persist as it comes in, so a failure in a later step never discards logs, context or
    // connection info that an earlier step already reported.
    const resourceConnection: Record<string, any> = { ...(update.resourceConnections[resource.id] ?? {}) };
    const resourceContext: Record<string, any> = { ...(update.resourceContexts[resource.id] ?? {}) };

    const persistUpdate = async () => {
      update.resourceConnections[resource.id] = resourceConnection;
      update.resourceContexts[resource.id] = resourceContext;
      await this.deploymentUpdates.save(update);
    };

    // The worker reports each sub-step as discrete lifecycle events keyed by a sub-step id, which
    // we persist as their own rows (parented to the step). The map correlates that key to the row.
    // Log lines are appended to the sub-step they belong to, or to the step when reported outside one.
    const subStepsByKey = new Map<string, DeploymentUpdateSubStepEntity>();

    const handleEvent = async (event: ResourceEventDto) => {
      switch (event.type) {
        case 'startStep':
          if (step) {
            const subStep = this.deploymentSubSteps.create({
              name: event.name,
              startedAt: event.timestamp,
              status: 'Running',
              stepId: step.id,
            });
            await this.deploymentSubSteps.save(subStep);
            subStepsByKey.set(event.id, subStep);
          }
          break;
        case 'completeStep': {
          const subStep = subStepsByKey.get(event.id);
          if (subStep) {
            subStep.status = 'Completed';
            subStep.completedAt = event.timestamp;
            await this.deploymentSubSteps.save(subStep);
          }
          break;
        }
        case 'failStep': {
          const subStep = subStepsByKey.get(event.id);
          if (subStep) {
            subStep.status = 'Failed';
            subStep.error = event.message ?? subStep.error;
            subStep.completedAt = event.timestamp;
            await this.deploymentSubSteps.save(subStep);
          }
          break;
        }
        case 'appendLog': {
          const log = { message: event.message, timestamp: event.timestamp.toISOString() };
          const subStep = event.stepId != null ? subStepsByKey.get(event.stepId) : undefined;
          if (subStep) {
            subStep.logs.push(log);
            await this.deploymentSubSteps.save(subStep);
          } else if (step) {
            step.logs.push(log);
            await this.deploymentSteps.save(step);
          }
          break;
        }
        case 'appendContext':
          updateContext(resourceId, update.context, event.context);
          await persistUpdate();
          break;
        case 'appendResourceContext':
          Object.assign(resourceContext, event.context);
          await persistUpdate();
          break;
        case 'appendConnection':
          Object.assign(resourceConnection, event.connection);
          await persistUpdate();
          break;
      }
    };

    try {
      await lastValueFrom(
        client.applyResourceStreamed(request).pipe(
          concatMap(async (event) => {
            heartbeat();
            await handleEvent(event);
          }),
        ),
        { defaultValue: undefined },
      );
    } catch (ex) {
      // Flush whatever was reported before the failure. Any sub-step still marked running did not
      // get its failStep event (e.g. the stream was cut), so fail it here as a safety net.
      for (const subStep of subStepsByKey.values()) {
        if (subStep.status === 'Running') {
          subStep.status = 'Failed';
          subStep.completedAt = new Date();
          await this.deploymentSubSteps.save(subStep);
        }
      }

      await persistUpdate();

      if (step) {
        step.error = ex instanceof Error ? ex.message : `${ex}`;
        await this.deploymentSteps.save(step);
      }

      throw ex;
    }

    await persistUpdate();

    if (step) {
      step.status = 'Completed';
      step.error = null;
      step.completedAt = new Date();
      await this.deploymentSteps.save(step);
    }
  }

  private async startStep(stepId: number | null | undefined) {
    if (!stepId) {
      return null;
    }

    const step = await this.deploymentSteps.findOne({ where: { id: stepId } });
    if (!step) {
      return null;
    }

    step.status = 'Running';
    step.attempt = activityInfo().attempt;
    step.startedAt = step.startedAt ?? new Date();
    step.logs = [];

    // A fresh attempt starts clean, so drop the sub-steps of the previous attempt.
    await this.deploymentSubSteps.delete({ stepId: step.id });
    await this.deploymentSteps.save(step);
    return step;
  }
}

export async function deployResource(param: DeployResourceParam): Promise<any> {
  return param;
}
