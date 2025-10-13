import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export type DeleteDeploymentsParam = { deploymentId: number };

const { deleteDeployment: deleteDeploymentActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5m',
  retry: {
    maximumAttempts: 5,
  },
});

export async function deleteDeployment({ deploymentId }: DeleteDeploymentsParam): Promise<void> {
  await deleteDeploymentActivity({ deploymentId });
}
