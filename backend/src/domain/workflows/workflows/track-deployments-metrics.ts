import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { TRACKING_RETRY_POLICY } from '../constants';

const { getDeployments, trackDeploymentMetrics } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2m',
  retry: TRACKING_RETRY_POLICY,
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
