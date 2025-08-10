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
    const client = new WorkerClient(workerEndpoint, workerApiKey);

    const resourceUniqueId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = evaluateParameters(resource, context);

    await client.deployment.deleteResources({
      resources: [
        {
          parameters: resourceParams,
          resourceContext: update.resourceContexts[resource.id] || {},
          resourceUniqueId,
          resourceType: resource.type,
          timeoutMs: 10 * 60 * 1000, // 10 minutes
        },
      ],
    });
  }
}

export async function deleteResource(param: DeleteResourceParam): Promise<any> {
  return param;
}
