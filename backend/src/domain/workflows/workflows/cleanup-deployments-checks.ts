import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { cleanupDeploymentsChecks: cleanupDeploymentsChecksActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function cleanupDeploymentsChecks(): Promise<void> {
  await cleanupDeploymentsChecksActivity({ maxDays: 90 });
}
