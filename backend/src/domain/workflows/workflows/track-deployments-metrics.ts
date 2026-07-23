import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { getDeployments, trackDeploymentMetrics } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2m',
  retry: {
    maximumAttempts: 1,
  },
});

export async function trackDeploymentsMetrics(): Promise<void> {
  const deployments = await getDeployments({});

  for (const { id: deploymentId } of deployments) {
    try {
      await trackDeploymentMetrics({
        deploymentId,
      });
    } catch (ex) {
      log.error(`Failed to track metrics for deployment ${deploymentId}:`, { cause: ex });
    }
  }
}
