import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addHours, differenceInHours } from 'date-fns';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUsageEntity,
  DeploymentUsageRepository,
} from 'src/domain/database';
import { evaluateParameters, evaluateUsage } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker/worker-client';
import { atHourUtc, formatDate } from 'src/lib';
import { Activity } from '../registration';

export interface TrackDeploymentUsageParam {
  deploymentId: number;
  trackDate: string;
  trackHour: number;
  workerApiKey: string;
  workerEndpoint: string;
}

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

    const lastUsage = await this.deploymentUsages.findOne({
      where: { deploymentId },
      order: { trackDate: 'DESC', trackHour: 'DESC' },
    });

    const targetDateTime = atHourUtc(trackDate, trackHour);

    let startDateTime: Date;
    if (lastUsage) {
      startDateTime = atHourUtc(lastUsage.trackDate, lastUsage.trackHour + 1);
    } else {
      startDateTime = targetDateTime;
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
    // The storage needs to be measured.
    const totalStorageGB = usageFromWorker.resources.reduce((a, c) => a + c.totalStorageGB, 0);

    const hoursToFill = differenceInHours(targetDateTime, startDateTime);

    for (let i = 0; i <= hoursToFill; i++) {
      const currentDateTime = addHours(startDateTime, i);

      const currentDate = formatDate(currentDateTime);
      const currentHour = currentDateTime.getHours();

      await this.deploymentUsages.save({
        deploymentId,
        trackDate: currentDate,
        trackHour: currentHour,
        totalCores,
        totalMemoryGB,
        totalVolumeGB,
        totalStorageGB,
      } as Partial<DeploymentUsageEntity>);
    }
  }
}

export async function trackDeploymentUsage(param: TrackDeploymentUsageParam): Promise<any> {
  return param;
}
