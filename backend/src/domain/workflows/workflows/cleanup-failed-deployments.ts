import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { CLEANUP_RETRY_POLICY } from '../constants';

const { cleanupFailedDeployments: cleanupFailedDeploymentsActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: CLEANUP_RETRY_POLICY,
});

export async function cleanupFailedDeployments(): Promise<void> {
  await cleanupFailedDeploymentsActivity({ maxDays: 3 });
}
