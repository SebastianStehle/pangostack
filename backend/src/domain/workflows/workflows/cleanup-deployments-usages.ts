import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { cleanupDeploymentsUsages: cleanupDeploymentsUsagesActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function cleanupDeploymentsUsages(): Promise<void> {
  await cleanupDeploymentsUsagesActivity({ maxDays: 90 });
}
