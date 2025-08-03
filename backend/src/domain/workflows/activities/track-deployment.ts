import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { DeploymentUsageEntity, DeploymentUsageRepository } from 'src/domain/database/entities/deployment-usage';
import { evaluateParameters, evaluateUsage } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { Activity } from '../registration';

export interface TrackDeploymentParam {
  trackDate: Date;
  trackHour: number;
  deploymentId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

@Injectable()
export class TrackDeploymentActivity implements Activity<TrackDeploymentParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentUsageEntity)
    private readonly deploymentUsages: DeploymentUsageRepository,
  ) {}

  async execute({ deploymentId, trackDate: date, trackHour: hour, workerApiKey, workerEndpoint }: TrackDeploymentParam) {
    const update = await this.deploymentUpdates.findOne({
      where: { deploymentId, status: 'Completed' },
      order: { id: 'DESC' },
      relations: ['serverVersion'],
    });

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

    const { totalCpus, totalMemoryGb, totalVolumeSizeGb } = evaluateUsage(update.serviceVersion.definition, context);
    // The storage needs to be measured.
    const totalStorageGb = usageFromWorker.resources.reduce((a, c) => a + c.totalStorageGB, 0);

    const usage = this.deploymentUsages.create();
    usage.deploymentId = deploymentId;
    usage.trackDate = date;
    usage.trackHour = hour;
    usage.totalCpus = totalCpus;
    usage.totalMemoryGb = totalMemoryGb;
    usage.totalVolumeGb = totalVolumeSizeGb;
    usage.totalStorage = totalStorageGb;
    await this.deploymentUsages.save(usage);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function trackDeployment(_: TrackDeploymentParam): Promise<any> {
  return true;
}
