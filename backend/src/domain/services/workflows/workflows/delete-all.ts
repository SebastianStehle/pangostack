import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { ResourceDefinition } from '../model';

export interface DeleteAllParam {
  deploymentId: number;
  resources: ResourceDefinition[];
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

const { deleteResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
  retry: {
    maximumAttempts: 5,
  },
});

export async function deleteAll({
  deploymentId,
  resources,
  updateId,
  workerApiKey,
  workerEndpoint,
}: DeleteAllParam): Promise<void> {
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
