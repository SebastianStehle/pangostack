import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, WorkerEntity, WorkerRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { ResourceStatus } from '../interfaces';

export class GetDeploymentStatus {
  constructor(
    public readonly teamId: number,
    public readonly deploymentId: number,
  ) {}
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
    const { deploymentId, teamId } = query;

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId, teamId },
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
    if (!lastUpdate) {
      return new GetDeploymentStatusResponse([]);
    }

    const client = new WorkerClient(worker.endpoint, worker.apiKey);
    const context = { env: lastUpdate.environment, context: lastUpdate.context, parameters: lastUpdate.parameters };

    const resources = lastUpdate.serviceVersion.definition.resources;

    const statuses = await client.status.postStatus({
      resources: resources.map((resource) => ({
        context: lastUpdate.resourceContexts[resource.id] || {},
        resourceId: `deployment_${deploymentId}_${resource.id}`,
        resourceType: resource.type,
        parameters: evaluateParameters(resource, context),
      })),
    });

    const mapped: ResourceStatus[] = statuses.resources.map((source, i) => ({
      resourceId: resources[i].id,
      resourceType: resources[i].type,
      resourceName: resources[i].name,
      workloads: source.workloads,
    }));

    return new GetDeploymentStatusResponse(mapped);
  }
}
