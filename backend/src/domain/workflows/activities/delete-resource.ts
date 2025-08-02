import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database/entities/deployment-update';
import { evaluateParameters, ResourceDefinition } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';

export interface DeleteResourceParam {
  deploymentId: number;
  resource: ResourceDefinition;
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

@Injectable()
export class DeleteResourceActivity {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdateRepository: DeploymentUpdateRepository,
  ) {}

  async execute({ deploymentId, resource, updateId, workerApiKey, workerEndpoint }: DeleteResourceParam): Promise<any> {
    const update = await this.deploymentUpdateRepository.findOneBy({ id: updateId });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    const resourceId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = evaluateParameters(resource, update.environment, update.context);

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
