import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { WorkerResolver } from 'src/domain/workers';
import { ResourceStatus } from '../interfaces';
import { getEvaluationContext, getResourceUniqueId } from '../libs';
import { DeploymentPolicy } from '../policies';

export class GetDeploymentStatusQuery extends Query<GetDeploymentStatusResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
  ) {
    super();
  }
}

export class GetDeploymentStatusResult {
  constructor(public readonly resources: ResourceStatus[]) {}
}

@QueryHandler(GetDeploymentStatusQuery)
export class GetDeploymentStatusHandler implements IQueryHandler<GetDeploymentStatusQuery, GetDeploymentStatusResult> {
  private readonly logger = new Logger(GetDeploymentStatusHandler.name);

  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    private readonly workerResolver: WorkerResolver,
  ) {}

  async execute(query: GetDeploymentStatusQuery): Promise<GetDeploymentStatusResult> {
    const { deploymentId, policy } = query;

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['updates', 'updates.serviceVersion'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy.isAllowed(deployment)) {
      throw new ForbiddenException();
    }

    const update = deployment.updates.find((x) => x.status === 'Completed');
    if (!update) {
      return new GetDeploymentStatusResult([]);
    }

    const workers = await this.workerResolver.getWorkers();
    if (workers.size === 0) {
      throw new NotFoundException('No worker available.');
    }

    const { context, definition } = getEvaluationContext(update);

    const mapped: ResourceStatus[] = [];
    for (const resource of definition.resources) {
      const worker = workers.get(resource.type);
      if (!worker) {
        this.logger.warn(`No worker registered for resource '${resource.type}'.`);
        continue;
      }

      const statuses = await worker.client.status.postStatus({
        resources: [
          {
            parameters: evaluateParameters(resource, context),
            resourceContext: update.resourceContexts[resource.id] || {},
            resourceUniqueId: getResourceUniqueId(deploymentId, resource),
            resourceType: resource.type,
            timeoutMs: 1 * 60 * 1000, // 1 minute
          },
        ],
      });

      // The worker answers with only one status.
      mapped.push(
        ...statuses.resources.map(({ workloads }) => ({
          resourceId: resource.id,
          resourceType: resource.type,
          resourceName: resource.name,
          workloads,
        })),
      );
    }

    return new GetDeploymentStatusResult(mapped);
  }
}
