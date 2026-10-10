import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { CLEANUP_RETRY_POLICY } from '../constants';

const { cleanupDeploymentsUsages: cleanupDeploymentsUsagesActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: CLEANUP_RETRY_POLICY,
});

export async function cleanupDeploymentsUsages(): Promise<void> {
  await cleanupDeploymentsUsagesActivity({ maxDays: 90 });
}
