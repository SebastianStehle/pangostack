import { Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database/entities/deployment-update';
import { evaluateParameters, ResourceDefinition } from 'src/domain/definitions';
import { WorkerClient } from '../worker-client';

export interface DeployResourceParam {
  deploymentId: number;
  resource: ResourceDefinition;
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

@Injectable()
export class DeployResourceActivity {
  private readonly logger = new Logger(DeployResourceActivity.name);

  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdateRepository: DeploymentUpdateRepository,
  ) {}

  async execute({ deploymentId, resource, updateId, workerApiKey, workerEndpoint }: DeployResourceParam): Promise<any> {
    const update = await this.deploymentUpdateRepository.findOneBy({ id: updateId });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    update.status = 'Pending';
    await this.deploymentUpdateRepository.save(update);

    const resourceId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = evaluateParameters(resource, update.environment, update.context);

    this.logger.log(`Deploying resource ${resource.id} for deployment ${deploymentId}`, {
      context: update.context,
      deploymentId,
      env: update.environment,
      parameters: resourceParams,
      parametersRaw: resource.parameters,
      resourceId,
    });

    const workerClient = new WorkerClient(workerEndpoint, workerApiKey);
    const response = await workerClient.deployment.applyResource({
      resourceId,
      resourceType: resource.type,
      parameters: resourceParams,
    });

    if (response.context) {
      for (const [key, value] of Object.entries(response.context)) {
        update.context[key] = value;
      }
    }

    if (response.log) {
      update.log[resource.id] = response.log;
    }

    await this.deploymentUpdateRepository.save(update);
  }
}

export async function deployResource(param: DeployResourceParam): Promise<any> {
  return param;
}
