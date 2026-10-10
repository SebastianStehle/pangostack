import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { CLEANUP_RETRY_POLICY } from '../constants';

const { cleanupDeploymentsChecks: cleanupDeploymentsChecksActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: CLEANUP_RETRY_POLICY,
});

export async function cleanupDeploymentsChecks(): Promise<void> {
  await cleanupDeploymentsChecksActivity({ maxDays: 90 });
}
