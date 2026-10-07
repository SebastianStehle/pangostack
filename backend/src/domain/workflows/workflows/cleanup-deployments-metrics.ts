import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { CLEANUP_RETRY_POLICY } from '../constants';

const { cleanupDeploymentsMetrics: cleanupDeploymentsMetricsActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2m',
  retry: CLEANUP_RETRY_POLICY,
});

export async function cleanupDeploymentsMetrics(): Promise<void> {
  await cleanupDeploymentsMetricsActivity({});
}
