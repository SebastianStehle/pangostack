import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUsageEntity,
  DeploymentUsageRepository,
} from 'src/domain/database';
import { evaluateParameters, evaluateUsage } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { Activity } from '../registration';

export type TrackDeploymentUsageParam = {
  deploymentId: number;
  trackDate: string;
  trackHour: number;
  workerApiKey: string;
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
    const update = await this.deploymentUpdates.findOne({
      where: { deploymentId, status: 'Completed' },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });

    if (!update) {
      throw new NotFoundException(`Uppdate for deployment ${deploymentId} not found`);
    }

    const definition = update.serviceVersion.definition;
    const context = { env: {}, context: {}, parameters: update.parameters };
    const worker = new WorkerClient(workerEndpoint, workerApiKey);

    const usageFromWorker = await worker.status.postUsage({
      resources: definition.resources.map((resource) => ({
        resourceId: resource.id,
        resourceType: resource.type,
        parameters: evaluateParameters(resource, context),
      })),
    });

    const { totalCores, totalMemoryGB, totalVolumeGB } = evaluateUsage(update.serviceVersion.definition, context);

    // The storage needs to be measured directly from the provider.
    const totalStorageGB = usageFromWorker.resources.reduce((a, c) => a + c.totalStorageGB, 0);

    await this.deploymentUsages.save({
      deploymentId,
      trackDate,
      trackHour,
      totalCores,
      totalMemoryGB,
      totalVolumeGB,
      totalStorageGB,
    } as Partial<DeploymentUsageEntity>);
  }
}

export async function trackDeploymentUsage(param: TrackDeploymentUsageParam): Promise<any> {
  return param;
}
