import { proxyActivities } from '@temporalio/workflow';
import { Topics } from 'src/domain/notifications/topics';
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

const { updateDeployment, getDeployment, getWorker, notify } = proxyActivities<typeof activities>({
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
      for (const resourceId of [...previousResourceIds].reverse()) {
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

  const deployment = await getDeployment({ id: deploymentId });
  if (!deployment) {
    return;
  }

  const deploymentProperties: Record<string, string> = Object.fromEntries(
    Object.entries(deployment).map(([key, value]) => [key, String(value)]),
  );

  const topic = Topics.team(deployment.teamId);
  if (previousResourceIds) {
    await notify({
      topic,
      templateCode: 'DEPLOYMENT_UPDATED',
      properties: {
        ...deploymentProperties,
      },
      url: deployment.url,
    });
  } else {
    await notify({
      topic,
      templateCode: 'DEPLOYMENT_CREATED',
      properties: {
        ...deploymentProperties,
      },
      url: deployment.url,
    });
  }
}
