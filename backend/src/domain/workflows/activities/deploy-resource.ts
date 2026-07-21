import { NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { activityInfo, heartbeat } from '@temporalio/activity';
import { concatMap, filter, lastValueFrom, map } from 'rxjs';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUpdateStepEntity,
  DeploymentUpdateStepRepository,
} from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { getEvaluationContext, getResourceUniqueId, updateContext } from 'src/domain/services';
import {
  ResourceApplyResponseDto,
  ResourceApplyStreamEvent,
  ResourceApplyStreamRequest,
  WorkerResolver,
} from 'src/domain/workers';
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

    let response: ResourceApplyResponseDto;
    try {
      response = await lastValueFrom(
        client.applyResourceStreamed(request).pipe(
          concatMap(async (event) => {
            heartbeat();

            if (event.type === 'subSteps' && step) {
              step.subSteps = event.subSteps;
              await this.deploymentSteps.save(step);
            }

            return event;
          }),
          filter((event): event is Extract<ResourceApplyStreamEvent, { type: 'result' }> => event.type === 'result'),
          map((event) => event.result),
        ),
      );
    } catch (ex) {
      // Keep the step running so that retries stay visible, but surface the error already.
      if (step) {
        step.error = ex instanceof Error ? ex.message : `${ex}`;
        await this.deploymentSteps.save(step);
      }

      throw ex;
    }

    update.resourceConnections[resource.id] = response.connection;
    update.resourceContexts[resource.id] = response.resourceContext || {};

    updateContext(resourceId, update.context, response.context);

    if (response.log) {
      update.log[resource.id] = response.log;
    }

    await this.deploymentUpdates.save(update);

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
    step.subSteps = [];

    await this.deploymentSteps.save(step);
    return step;
  }
}

export async function deployResource(param: DeployResourceParam): Promise<any> {
  return param;
}
