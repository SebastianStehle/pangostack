import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, WorkerEntity, WorkerRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/workers';
import { ResourceLog } from '../interfaces';
import { getEvaluationContext, getResourceUniqueId } from '../libs';
import { DeploymentPolicy } from '../policies';

export class GetDeploymentLogsQuery extends Query<GetDeploymentLogsResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
  ) {
    super();
  }
}

export class GetDeploymentLogsResult {
  constructor(public readonly resources: ResourceLog[]) {}
}

@QueryHandler(GetDeploymentLogsQuery)
export class GetDeploymentLogsHandler implements IQueryHandler<GetDeploymentLogsQuery, GetDeploymentLogsResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(query: GetDeploymentLogsQuery): Promise<GetDeploymentLogsResult> {
    const { deploymentId, policy } = query;

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['updates', 'updates.serviceVersion'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy) {
      throw new ForbiddenException();
    }

    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    const update = deployment.updates.find((x) => x.status === 'Completed');
    if (!update) {
      return new GetDeploymentLogsResult([]);
    }

    const { context, definition } = getEvaluationContext(update);
    const client = new WorkerClient(worker.endpoint, worker.apiKey);

    const statuses = await client.status.postLog({
      resources: definition.resources.map((resource) => ({
        parameters: evaluateParameters(resource, context),
        resourceContext: update.resourceContexts[resource.id] || {},
        resourceUniqueId: getResourceUniqueId(deploymentId, resource),
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

    return new GetDeploymentLogsResult(mapped);
  }
}
