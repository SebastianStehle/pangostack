import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { Activity } from '../registration';

export type DeleteResourceParam = {
  deploymentId: number;
  resourceId: string;
  updateId: number;
  workerApiKey?: string;
  workerEndpoint: string;
};

@Activity(deleteResource)
export class DeleteResourceActivity implements Activity<DeleteResourceParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute({ deploymentId, resourceId, updateId, workerApiKey, workerEndpoint }: DeleteResourceParam) {
    const update = await this.deploymentUpdates.findOne({ where: { id: updateId }, relations: ['serviceVersion'] });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    const resource = update.serviceVersion.definition.resources.find((x) => x.id === resourceId);
    if (!resource) {
      throw new NotFoundException(`Deployment Update ${updateId} does not contain resource ${resourceId}.`);
    }

    const context = { env: update.environment, context: update.context, parameters: update.parameters };

    const resourceWorkerId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = evaluateParameters(resource, context);

    const workerClient = new WorkerClient(workerEndpoint, workerApiKey);
    await workerClient.deployment.deleteResources({
      resources: [
        {
          context: update.resourceContexts[resource.id] || {},
          resourceId: resourceWorkerId,
          resourceType: resource.type,
          parameters: resourceParams,
        },
      ],
    });
  }
}

export async function deleteResource(param: DeleteResourceParam): Promise<any> {
  return param;
}
