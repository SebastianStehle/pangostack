import * as https from 'https';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database/entities/deployment-update';
import { expression } from 'src/lib';
import { Configuration, DeploymentApi } from '../../generated';
import { ResourceDefinition } from '../model';

export interface DeployResourceParam {
  deploymentId: number;
  resource: ResourceDefinition;
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

@Injectable()
export class DeployResourceActivity {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdateRepository: DeploymentUpdateRepository,
  ) {}

  async execute({ deploymentId, resource, updateId, workerApiKey, workerEndpoint }: DeployResourceParam): Promise<any> {
    const update = await this.deploymentUpdateRepository.findOneBy({ id: updateId });
    if (!update) {
      throw new NotFoundException();
    }

    update.status = 'Pending';
    await this.deploymentUpdateRepository.save(update);

    const { environment: env, context, parameters } = update;

    const resourceId = `deployment_${deploymentId}_${resource.id}`;
    const resourceParams = { ...resource.parameters };
    for (const [key, value] of Object.entries(resource.parameters)) {
      resourceParams[key] = expression(value, { env, context, parameters });
    }

    const api = new DeploymentApi(
      new Configuration({
        headers: {
          ['X-ApiKey']: workerApiKey,
        },
        fetchApi: async (request, init) => {
          const agent = new https.Agent({
            rejectUnauthorized: false,
          });

          const result = await fetch(request as any, { ...init, agent } as any);
          return result as any;
        },
        basePath: workerEndpoint,
      }),
    );

    const response = await api.apply({
      resourceId,
      resourceName: resource.type,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deployResource(_: DeployResourceParam): Promise<any> {
  return true;
}
