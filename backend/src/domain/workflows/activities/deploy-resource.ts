import { NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { evaluateParameters, ResourceDefinition } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker/worker-client';
import { Activity } from '../registration';

export interface DeployResourceParam {
  deploymentId: number;
  resource: ResourceDefinition;
  workerApiKey: string;
  workerEndpoint: string;
  updateId: number;
}

@Activity(deployResource)
export class DeployResourceActivity implements Activity<DeployResourceParam> {
  private readonly logger = new Logger(DeployResourceActivity.name);

  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute({ deploymentId, resource, updateId, workerApiKey, workerEndpoint }: DeployResourceParam) {
    const update = await this.deploymentUpdates.findOneBy({ id: updateId });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    update.status = 'Pending';
    await this.deploymentUpdates.save(update);

    const context = { env: update.environment, context: update.context, parameters: update.parameters };

    const resourceId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = evaluateParameters(resource, context);

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

    update.connections[resource.id] = response.connection;

    if (response.context) {
      for (const [key, value] of Object.entries(response.context)) {
        update.context[key] = value;
      }
    }

    if (response.log) {
      update.log[resource.id] = response.log;
    }

    await this.deploymentUpdates.save(update);
  }
}

export async function deployResource(param: DeployResourceParam): Promise<any> {
  return param;
}
