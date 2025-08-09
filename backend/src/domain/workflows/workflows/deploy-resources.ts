import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface DeployResourcesParam {
  deploymentId: number;
  previousResourceIds?: string[] | null;
  previousUpdateId?: number | null;
  resourceIds: string[];
  updateId: number;
  workerApiKey?: string;
  workerEndpoint: string;
}

const { deleteResource, deployResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 5,
  },
});

const { updateDeployment } = proxyActivities<typeof activities>({
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
  workerApiKey,
  workerEndpoint,
}: DeployResourcesParam): Promise<any> {
  await updateDeployment({ updateId, status: 'Running' });

  try {
    if (previousResourceIds) {
      for (const resourceId of previousResourceIds) {
        const inPrevious = previousResourceIds.indexOf(resourceId) >= 0;
        if (!inPrevious && previousUpdateId) {
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
  } catch (error: any) {
    await updateDeployment({ updateId, status: 'Failed', error: `${error}` });
  }
}
