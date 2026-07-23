import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { WorkerResolver } from 'src/domain/workers';
import { Activity } from '../registration';

export type GetResourceWorkersParam = { resourceIds: string[]; updateId: number };

// Maps the ID of a resource to the endpoint of the worker that provides its resource type.
export type GetResourceWorkersResult = Record<string, string>;

@Activity(getResourceWorkers)
export class GetResourceWorkersActivity implements Activity<GetResourceWorkersParam, GetResourceWorkersResult> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    private readonly workerResolver: WorkerResolver,
  ) {}

  async execute({ resourceIds, updateId }: GetResourceWorkersParam) {
    const update = await this.deploymentUpdates.findOne({ where: { id: updateId }, relations: ['serviceVersion'] });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    const workers = await this.workerResolver.getWorkers();

    // The workflow resolves the workers once and passes the endpoint to each activity, so that a
    // retry cannot deploy and delete the same resource on different workers. Only the requested
    // resources are resolved, so that an unrelated resource type without a worker does not fail
    // the whole workflow.
    const workerEndpoints: Record<string, string> = {};
    for (const { id, type } of update.serviceVersion.definition.resources) {
      if (resourceIds.indexOf(id) < 0) {
        continue;
      }

      const worker = workers.get(type);
      if (worker) {
        workerEndpoints[id] = worker.client.basePath;
      }
    }

    return workerEndpoints;
  }
}

export async function getResourceWorkers(param: GetResourceWorkersParam): Promise<GetResourceWorkersResult> {
  return param as any;
}
