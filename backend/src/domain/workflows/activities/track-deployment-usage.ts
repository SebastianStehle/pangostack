import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUsageEntity,
  DeploymentUsageRepository,
} from 'src/domain/database';
import { evaluateParameters, evaluateUsage } from 'src/domain/definitions';
import { getEvaluationContext, getResourceUniqueId } from 'src/domain/services';
import { WorkerClient } from 'src/domain/workers';
import { Activity } from '../registration';

export type TrackDeploymentUsageParam = {
  deploymentId: number;
  trackDate: string;
  trackHour: number;
  workerApiKey?: string;
  workerEndpoint: string;
};

@Activity(trackDeploymentUsage)
export class TrackDeploymentUsageActivity implements Activity<TrackDeploymentUsageParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentUsageEntity)
    private readonly deploymentUsages: DeploymentUsageRepository,
  ) {}

  async execute({ deploymentId, trackDate, trackHour, workerApiKey, workerEndpoint }: TrackDeploymentUsageParam) {
    const updates = await this.deploymentUpdates.find({
      where: { deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });

    if (updates.length === 0) {
      // Throw an error to make the tracking easier.
      throw new NotFoundException(`Update for deployment ${deploymentId} not found`);
    }

    const update = updates.find((x) => x.status === 'Completed');
    if (!update) {
      // Deployment has not been completed yet. This is normal behavior.
      return;
    }

    const { context, definition } = getEvaluationContext(update);
    const client = new WorkerClient(workerEndpoint, workerApiKey);

    const usageFromWorker = await client.status.postUsage({
      resources: definition.resources.map((resource) => ({
        parameters: evaluateParameters(resource, context),
        resourceContext: update.resourceContexts[resource.id] || {},
        resourceUniqueId: getResourceUniqueId(deploymentId, resource),
        resourceType: resource.type,
        timeoutMs: 1 * 60 * 1000, // 1 minute
      })),
    });

    // The storage needs to be measured directly from the provider.
    const totalStorageGB = usageFromWorker.resources.reduce((a, c) => a + c.totalStorageGB, 0);

    if (totalStorageGB === 0 && update.serviceVersion.definition.pricingModel === 'fixed') {
      // There is nothing to track as the pricing model is fixed.
      return;
    }

    const { totalCores, totalMemoryGB, totalVolumeGB } = evaluateUsage(update.serviceVersion.definition, context);
    if (totalCores === 0 && totalMemoryGB === 0 && totalVolumeGB === 0 && totalStorageGB === 0) {
      return;
    }

    const deploymentUsage = this.deploymentUsages.create({
      deploymentId,
      trackDate,
      trackHour,
      totalCores,
      totalMemoryGB,
      totalVolumeGB,
      totalStorageGB,
    });

    await this.deploymentUsages.save(deploymentUsage);
  }
}

export async function trackDeploymentUsage(param: TrackDeploymentUsageParam): Promise<any> {
  return param;
}
