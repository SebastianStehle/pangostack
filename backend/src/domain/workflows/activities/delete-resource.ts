import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { activityInfo } from '@temporalio/activity';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUpdateStepEntity,
  DeploymentUpdateStepRepository,
} from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { getEvaluationContext, getResourceUniqueId } from 'src/domain/services';
import { WorkerClient } from 'src/domain/workers';
import { Activity } from '../registration';

const RESOURCE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export type DeleteResourceParam = {
  deploymentId: number;
  resourceId: string;
  stepId?: number | null;
  updateId: number;
  workerApiKey?: string;
  workerEndpoint: string;
};

@Activity(deleteResource)
export class DeleteResourceActivity implements Activity<DeleteResourceParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentUpdateStepEntity)
    private readonly deploymentSteps: DeploymentUpdateStepRepository,
  ) {}

  async execute({ deploymentId, resourceId, stepId, updateId, workerApiKey, workerEndpoint }: DeleteResourceParam) {
    const update = await this.deploymentUpdates.findOne({ where: { id: updateId }, relations: ['serviceVersion'] });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    const resource = update.serviceVersion.definition.resources.find((x) => x.id === resourceId);
    if (!resource) {
      throw new NotFoundException(`Deployment Update ${updateId} does not contain resource ${resourceId}.`);
    }

    const step = await this.startStep(stepId);

    const { context } = getEvaluationContext(update);
    const client = new WorkerClient(workerEndpoint, workerApiKey);

    try {
      await client.deployment.deleteResources({
        resources: [
          {
            parameters: evaluateParameters(resource, context),
            resourceContext: update.resourceContexts[resource.id] || {},
            resourceUniqueId: getResourceUniqueId(deploymentId, resource),
            resourceType: resource.type,
            timeoutMs: RESOURCE_TIMEOUT_MS,
          },
        ],
      });
    } catch (ex) {
      // Keep the step running so that retries stay visible, but surface the error already.
      if (step) {
        step.error = ex instanceof Error ? ex.message : `${ex}`;
        await this.deploymentSteps.save(step);
      }

      throw ex;
    }

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

    await this.deploymentSteps.save(step);
    return step;
  }
}

export async function deleteResource(param: DeleteResourceParam): Promise<any> {
  return param;
}
