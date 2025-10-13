import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface DeployResourcesParam {
  deploymentId: number;
  previousResourceIds?: string[] | null;
  previousUpdateId?: number | null;
  resourceIds: string[];
  updateId: number;
}

const { deleteResource, deployResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 5,
    initialInterval: '1m',
  },
});

const { updateDeployment, getWorker } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 3,
  },
});

export async function deployResources({
  deploymentId,
  previousResourceIds,
  previousUpdateId,
  resourceIds,
  updateId,
}: DeployResourcesParam): Promise<any> {
  await updateDeployment({ updateId, status: 'Running' });

  const { workerApiKey, workerEndpoint } = await getWorker({});
  try {
    if (previousResourceIds) {
      for (const resourceId of previousResourceIds.reverse()) {
        const inCurrent = resourceIds.indexOf(resourceId) >= 0;
        if (!inCurrent && previousUpdateId) {
          await deleteResource({
            deploymentId,
            resourceId,
            updateId: previousUpdateId,
            workerApiKey,
            workerEndpoint,
          });
        }
      }
    }

    for (const resourceId of resourceIds) {
      await deployResource({
        deploymentId,
        resourceId,
        updateId,
        workerApiKey,
        workerEndpoint,
      });
    }
    await updateDeployment({ updateId, status: 'Completed' });
  } catch (ex) {
    await updateDeployment({ updateId, status: 'Failed', error: `${ex}` });
  }
}
