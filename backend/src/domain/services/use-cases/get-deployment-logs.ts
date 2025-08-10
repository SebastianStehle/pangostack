import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, WorkerEntity, WorkerRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { ResourceLog } from '../interfaces';

export class GetDeploymentLogs {
  constructor(
    public readonly teamId: number,
    public readonly deploymentId: number,
  ) {}
}

export class GetDeploymentLogsResponse {
  constructor(public readonly resources: ResourceLog[]) {}
}

@QueryHandler(GetDeploymentLogs)
export class GetDeploymentLogsHandler implements IQueryHandler<GetDeploymentLogs, GetDeploymentLogsResponse> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(query: GetDeploymentLogs): Promise<GetDeploymentLogsResponse> {
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

    const update = deployment.updates.find((x) => x.status === 'Completed');
    if (!update) {
      return new GetDeploymentLogsResponse([]);
    }

    const definition = update.serviceVersion.definition;
    const context = { env: update.environment, context: update.context, parameters: update.parameters };
    const client = new WorkerClient(worker.endpoint, worker.apiKey);

    const statuses = await client.status.postLog({
      resources: definition.resources.map((resource) => ({
        parameters: evaluateParameters(resource, context),
        resourceContext: update.resourceContexts[resource.id] || {},
        resourceUniqueId: `deployment_${deploymentId}_${resource.id}`,
        resourceType: resource.type,
        timeoutMs: 1 * 60 * 1000, // 1 minute
      })),
    });

    const mapped: ResourceLog[] = statuses.resources.map((source, i) => ({
      resourceId: definition.resources[i].id,
      resourceType: definition.resources[i].type,
      resourceName: definition.resources[i].name,
      instances: source.instances,
    }));

    return new GetDeploymentLogsResponse(mapped);
  }
}
