import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { cleanupFailedDeployments: cleanupFailedDeploymentsActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function cleanupFailedDeployments(): Promise<void> {
  await cleanupFailedDeploymentsActivity({ maxDays: 3 });
}
