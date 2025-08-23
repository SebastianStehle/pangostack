import { log, proxyActivities } from '@temporalio/workflow';
import { todayUtcDate } from 'src/lib/time';
import type * as activities from '../activities';

const { getWorker, getDeployments, trackDeploymentUsage } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function trackDeploymentsUsage(): Promise<void> {
  const { workerApiKey, workerEndpoint } = await getWorker({});
  const deployments = await getDeployments({});

  const trackDate = todayUtcDate();
  const trackHour = new Date().getUTCHours();

  for (const deploymentId of deployments) {
    try {
      await trackDeploymentUsage({
        deploymentId,
        trackDate,
        trackHour,
        workerApiKey,
        workerEndpoint,
      });
    } catch (ex) {
      log.error(`Failed to track deployment ${deploymentId}:`, { cause: ex });
    }
  }
}
