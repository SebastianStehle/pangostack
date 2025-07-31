import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, WorkerEntity, WorkerRepository } from 'src/domain/database';
import { ResourceStatus } from '../interfaces';
import { evaluateParameters, parseDefinition } from '../workflows/model';
import { WorkerClient } from '../workflows/worker-client';

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

    const definition = parseDefinition(lastUpdate.serviceVersion.definition);

    const workerClient = new WorkerClient(worker.endpoint, worker.apiKey);
    const statuses = await workerClient.status.getStatus({
      resources: definition.resources.map((resource) => ({
        resourceId: `deployment_${deploymentId}_${resource.id}`,
        resourceName: resource.name,
        parameters: evaluateParameters(resource, lastUpdate.environment, {}),
      })),
    });

    return new GetDeploymentStatusResponse(statuses.resources);
  }
}
