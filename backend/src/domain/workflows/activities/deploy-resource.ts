import { NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { WorkerClient } from 'src/domain/worker';
import { ResourceApplyRequestDto } from 'src/domain/worker/generated';
import { Activity } from '../registration';

export type DeployResourceParam = {
  deploymentId: number;
  resourceId: string;
  workerApiKey?: string;
  workerEndpoint: string;
  updateId: number;
};

@Activity(deployResource)
export class DeployResourceActivity implements Activity<DeployResourceParam> {
  private readonly logger = new Logger(DeployResourceActivity.name);

  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute({ deploymentId, resourceId, updateId, workerApiKey, workerEndpoint }: DeployResourceParam) {
    const update = await this.deploymentUpdates.findOne({ where: { id: updateId }, relations: ['serviceVersion'] });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    const resource = update.serviceVersion.definition.resources.find((x) => x.id === resourceId);
    if (!resource) {
      throw new NotFoundException(`Deployment Update ${updateId} does not contain resource ${resourceId}.`);
    }

    update.status = 'Pending';
    await this.deploymentUpdates.save(update);

    const context = { env: update.environment, context: update.context, parameters: update.parameters };

    const resourceWorkerId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = evaluateParameters(resource, context);

    this.logger.log(`Deploying resource ${resource.id} for deployment ${deploymentId}`, {
      context: update.context,
      deploymentId,
      env: update.environment,
      parameters: resourceParams,
      parametersRaw: resource.parameters,
      resourceId: resourceWorkerId,
    });

    const request: ResourceApplyRequestDto = {
      context: update.resourceContexts[resource.id] || {},
      resourceId: resourceWorkerId,
      resourceType: resource.type,
      parameters: resourceParams,
    };

    this.logger.log({
      message: 'Sending request to worker',
      request,
      context: 'WorkerService',
    });

    const workerClient = new WorkerClient(workerEndpoint, workerApiKey);
    const workerResponse = await workerClient.deployment.applyResource(request);

    update.resourceConnections[resource.id] = workerResponse.connection;
    update.resourceContexts[resource.id] = workerResponse.context;

    if (workerResponse.context) {
      for (const [key, value] of Object.entries(workerResponse.context)) {
        update.context[key] = value;
      }
    }

    if (workerResponse.log) {
      update.log[resource.id] = workerResponse.log;
    }

    await this.deploymentUpdates.save(update);
  }
}

export async function deployResource(param: DeployResourceParam): Promise<any> {
  return param;
}
