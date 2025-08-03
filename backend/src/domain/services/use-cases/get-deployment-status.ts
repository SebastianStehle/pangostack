import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, WorkerEntity, WorkerRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { ResourceStatus } from '../interfaces';

export class GetDeploymentStatus {
  constructor(public readonly deploymentId: number) {}
}

export class GetDeploymentStatusResponse {
  constructor(public readonly resources: ResourceStatus[]) {}
}

@QueryHandler(GetDeploymentStatus)
export class GetDeploymentStatusHandler implements IQueryHandler<GetDeploymentStatus, GetDeploymentStatusResponse> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(query: GetDeploymentStatus): Promise<GetDeploymentStatusResponse> {
    const { deploymentId } = query;

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['updates', 'updates.serviceVersion'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    const lastUpdate = deployment.updates.find((x) => x.status === 'Completed');
    if (lastUpdate === null) {
      return new GetDeploymentStatusResponse([]);
    }

    const workerClient = new WorkerClient(worker.endpoint, worker.apiKey);

    const context = { env: lastUpdate.environment, context: lastUpdate.context, parameters: lastUpdate.parameters };

    const statuses = await workerClient.status.postStatus({
      resources: lastUpdate.serviceVersion.definition.resources.map((resource) => ({
        resourceId: `deployment_${deploymentId}_${resource.id}`,
        resourceType: resource.type,
        parameters: evaluateParameters(resource, context),
      })),
    });

    return new GetDeploymentStatusResponse(statuses.resources as any);
  }
}
