import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export type DeleteResourcesParam = { deploymentId: number; resourceIds: string[]; updateId: number };

const { deleteResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 5,
  },
});

const { getWorker } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 3,
  },
});

export async function deleteResources({ deploymentId, resourceIds, updateId }: DeleteResourcesParam): Promise<void> {
  const { workerApiKey, workerEndpoint } = await getWorker({});

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
