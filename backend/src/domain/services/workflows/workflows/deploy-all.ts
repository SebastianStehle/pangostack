import { proxyActivities } from '@temporalio/workflow';
import { ResourceDefinition } from 'src/domain/definitions';
import type * as activities from '../activities';

export interface DeployAllParam {
  deploymentId: number;
  previousResources: ResourceDefinition[] | null;
  previousUpdateId: number | null;
  resources: ResourceDefinition[];
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

const { deleteResource, deployResource, updateDeployment } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
  retry: {
    maximumAttempts: 5,
  },
});

export async function deployAll({
  deploymentId,
  previousResources,
  previousUpdateId,
  resources,
  updateId,
  workerApiKey,
  workerEndpoint,
}: DeployAllParam): Promise<void> {
  await updateDeployment({ updateId, status: 'Running' });

  try {
    if (previousResources) {
      for (const resource of previousResources) {
        const inPrevious = previousResources.find((x) => x.id === resource.id);
        if (!inPrevious) {
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
