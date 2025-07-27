import * as https from 'https';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database/entities/deployment-update';
import { expression } from 'src/lib';
import { Configuration, DeploymentApi } from '../../generated';
import { ResourceDefinition } from '../model';

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
      throw new NotFoundException();
    }

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

    await api._delete({
      resources: [
        {
          resourceId,
          resourceName: resource.type,
          parameters: resourceParams,
        },
      ],
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteResource(_: DeleteResourceParam): Promise<any> {
  return true;
}
