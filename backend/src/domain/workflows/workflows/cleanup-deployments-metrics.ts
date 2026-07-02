import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { cleanupDeploymentsMetrics: cleanupDeploymentsMetricsActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2m',
  retry: {
    maximumAttempts: 1,
  },
});

export async function cleanupDeploymentsMetrics(): Promise<void> {
  await cleanupDeploymentsMetricsActivity({});
}
