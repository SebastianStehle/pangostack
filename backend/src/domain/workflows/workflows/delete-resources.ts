import { proxyActivities } from '@temporalio/workflow';
import { ResourceDefinition } from 'src/domain/definitions';
import type * as activities from '../activities';

export interface DeleteResourcesParam {
  deploymentId: number;
  resources: ResourceDefinition[];
  updateId: number;
  workerApiKey?: string;
  workerEndpoint: string;
}

const { deleteResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 5,
  },
});

export async function deleteResources({
  deploymentId,
  resources,
  updateId,
  workerApiKey,
  workerEndpoint,
}: DeleteResourcesParam): Promise<void> {
  for (const resource of resources) {
    await deleteResource({
      workerApiKey,
      workerEndpoint,
      resource,
      deploymentId,
      updateId,
    });
  }
}
