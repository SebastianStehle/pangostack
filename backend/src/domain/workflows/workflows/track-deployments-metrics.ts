import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { getWorker, getDeployments, trackDeploymentMetrics } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2m',
  retry: {
    maximumAttempts: 1,
  },
});

export async function trackDeploymentsMetrics(): Promise<void> {
  const { workerApiKey, workerEndpoint } = await getWorker({});
  const deployments = await getDeployments({});

  for (const { id: deploymentId } of deployments) {
    try {
      await trackDeploymentMetrics({
        deploymentId,
        workerApiKey,
        workerEndpoint,
      });
    } catch (ex) {
      log.error(`Failed to track metrics for deployment ${deploymentId}:`, { cause: ex });
    }
  }
}
