import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { ResourceDefinition } from '../model';

export interface DeployAllParam {
  deploymentId: number;
  resources: ResourceDefinition[];
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

const { deployResource, updateDeployment } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
});

export async function deployAll({
  deploymentId,
  resources,
  updateId,
  workerApiKey,
  workerEndpoint,
}: DeployAllParam): Promise<void> {
  await updateDeployment({ updateId, status: 'Running' });

  try {
    for (const resource of resources) {
      await deployResource({
        workerApiKey,
        workerEndpoint,
        resource,
        deploymentId,
        updateId,
      });
    }
    await updateDeployment({ updateId, status: 'Completed' });
  } catch (error: any) {
    await updateDeployment({ updateId, status: 'Failed', error: `${error}` });
  }
}
