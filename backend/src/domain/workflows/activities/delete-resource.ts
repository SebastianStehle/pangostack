import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { evaluateParameters, ResourceDefinition } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { Activity } from '../registration';

export interface DeleteResourceParam {
  deploymentId: number;
  resource: ResourceDefinition;
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

@Activity(deleteResource)
export class DeleteResourceActivity implements Activity<DeleteResourceParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute({ deploymentId, resource, updateId, workerApiKey, workerEndpoint }: DeleteResourceParam) {
    const update = await this.deploymentUpdates.findOneBy({ id: updateId });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    const context = { env: update.environment, context: update.context, parameters: update.parameters };

    const resourceId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = evaluateParameters(resource, context);

    const workerClient = new WorkerClient(workerEndpoint, workerApiKey);
    await workerClient.deployment.deleteResources({
      resources: [
        {
          resourceId,
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
