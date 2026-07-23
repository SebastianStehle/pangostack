import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export type DeleteResourcesParam = { deploymentId: number; resourceIds: string[]; updateId: number };

const { deleteResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 5,
  },
});

const { getResourceWorkers } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 3,
  },
});

export async function deleteResources({ deploymentId, resourceIds, updateId }: DeleteResourcesParam): Promise<void> {
  const workerEndpoints = await getResourceWorkers({ resourceIds, updateId });

  for (const resourceId of [...resourceIds].reverse()) {
    await deleteResource({
      resourceId,
      deploymentId,
      updateId,
      workerEndpoint: workerEndpoints[resourceId],
    });
  }
}
