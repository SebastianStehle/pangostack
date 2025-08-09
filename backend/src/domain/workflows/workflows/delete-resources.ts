import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface DeleteResourcesParam {
  deploymentId: number;
  resourceIds: string[];
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
  resourceIds,
  updateId,
  workerApiKey,
  workerEndpoint,
}: DeleteResourcesParam): Promise<void> {
  for (const resourceId of resourceIds) {
    await deleteResource({
      workerApiKey,
      workerEndpoint,
      resourceId,
      deploymentId,
      updateId,
    });
  }
}
