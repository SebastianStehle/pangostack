import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUsageEntity,
  DeploymentUsageRepository,
} from 'src/domain/database';
import { evaluateParameters, evaluatePrices, evaluateUsage } from 'src/domain/definitions';
import { getEvaluationContext, getResourceUniqueId } from 'src/domain/services';
import { UsageResultDto, WorkerResolver } from 'src/domain/workers';
import { Activity } from '../registration';

export type TrackDeploymentUsageParam = {
  deploymentId: number;
  trackDate: string;
  trackHour: number;
};

@Activity(trackDeploymentUsage)
export class TrackDeploymentUsageActivity implements Activity<TrackDeploymentUsageParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentUsageEntity)
    private readonly deploymentUsages: DeploymentUsageRepository,
    private readonly workerResolver: WorkerResolver,
  ) {}

  async execute({ deploymentId, trackDate, trackHour }: TrackDeploymentUsageParam) {
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
    const workers = await this.workerResolver.getWorkers();

    const responses: UsageResultDto[] = [];
    for (const resource of definition.resources) {
      const worker = workers.get(resource.type);
      if (!worker) {
        // Do not log missing workers. It would flood the log with entries.
        continue;
      }
      responses.push(
        await worker.client.status.postUsage({
          resources: [
            {
              parameters: evaluateParameters(resource, context),
              resourceContext: update.resourceContexts[resource.id] || {},
              resourceUniqueId: getResourceUniqueId(deploymentId, resource),
              resourceType: resource.type,
              timeoutMs: 1 * 60 * 1000, // 1 minute
            },
          ],
        }),
      );
    }

    // The storage needs to be measured directly from the provider.
    let totalStorageGB = 0;
    for (const { resources } of responses) {
      for (const resource of resources) {
        totalStorageGB += resource.totalStorageGB;
      }
    }

    // Sums up all prices in the definition.
    const totalPrices = evaluatePrices(update.serviceVersion.definition, context);

    // Get the usage for pay per use definitions.
    const { totalCores, totalMemoryGB, totalVolumeGB } = evaluateUsage(update.serviceVersion.definition, context);

    if (
      totalCores === 0 &&
      totalMemoryGB === 0 &&
      totalVolumeGB === 0 &&
      totalStorageGB === 0 &&
      Object.keys(totalPrices).length === 0
    ) {
      return;
    }

    const deploymentUsage = this.deploymentUsages.create({
      additionalPrices: totalPrices,
      deploymentId,
      totalCores,
      totalMemoryGB,
      totalStorageGB,
      totalVolumeGB,
      trackDate,
      trackHour,
    });

    await this.deploymentUsages.save(deploymentUsage);
  }
}

export async function trackDeploymentUsage(param: TrackDeploymentUsageParam): Promise<any> {
  return param;
}
