import { proxyActivities } from '@temporalio/workflow';
import { ResourceDefinition } from 'src/domain/definitions';
import type * as activities from '../activities';

export interface DeployResourcesParam {
  deploymentId: number;
  previousResources?: ResourceDefinition[] | null;
  previousUpdateId?: number | null;
  resources: ResourceDefinition[];
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
  previousResources,
  previousUpdateId,
  resources,
  updateId,
  workerApiKey,
  workerEndpoint,
}: DeployResourcesParam): Promise<any> {
  await updateDeployment({ updateId, status: 'Running' });

  try {
    if (previousResources) {
      for (const resource of previousResources) {
        const inPrevious = previousResources.find((x) => x.id === resource.id);
        if (!inPrevious && previousUpdateId) {
          await deleteResource({
            deploymentId,
            resource,
            updateId: previousUpdateId,
            workerApiKey,
            workerEndpoint,
          });
        }
      }
    }

    for (const resource of resources) {
      await deployResource({
        deploymentId,
        resource,
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
