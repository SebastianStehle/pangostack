import { NotFoundException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { evaluateParameters } from 'src/domain/definitions';
import { getEvaluationContext, getResourceUniqueId } from 'src/domain/services';
import { WorkerClient } from 'src/domain/worker';
import { ResourceRequestDto } from 'src/domain/worker/generated';
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

    const { context } = getEvaluationContext(update);
    const client = new WorkerClient(workerEndpoint, workerApiKey);

    const resourceUniqueId = getResourceUniqueId(deploymentId, resource);
    const resourceParams = evaluateParameters(resource, context);

    this.logger.log(`Deploying resource ${resource.id} for deployment ${deploymentId}`, {
      context: update.context,
      deploymentId,
      env: update.environment,
      parameters: resourceParams,
      parametersRaw: resource.parameters,
      resourceUniqueId,
    });

    const request: ResourceRequestDto = {
      resourceContext: update.resourceContexts[resource.id] || {},
      resourceUniqueId,
      resourceType: resource.type,
      parameters: resourceParams,
      timeoutMs: 10 * 60 * 1000, // 10 minutes
    };

    this.logger.log({
      message: 'Sending request to worker',
      request,
      context: 'WorkerService',
    });

    const response = await client.deployment.applyResource(request);

    update.resourceConnections[resource.id] = response.connection;
    update.resourceContexts[resource.id] = response.resourceContext || {};

    if (response.context) {
      for (const [key, value] of Object.entries(response.context)) {
        const global = (update.context['global'] ||= {});
        global[key] = value;

        const local = (update.context[resourceId] ||= {});
        local[key] = value;
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
