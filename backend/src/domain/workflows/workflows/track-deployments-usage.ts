import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

interface TrackDeploymentsUsageParmas {
  trackDate: string;
  trackHour: number;
}

const { getWorker, getDeployments, trackDeploymentUsage } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function trackDeploymentsUsage({ trackDate, trackHour }: TrackDeploymentsUsageParmas): Promise<void> {
  const { workerApiKey, workerEndpoint } = await getWorker({});
  const deployments = await getDeployments({});

  for (const deploymentId of deployments) {
    try {
      await trackDeploymentUsage({
        deploymentId,
        trackDate,
        trackHour,
        workerApiKey,
        workerEndpoint,
      });
    } catch (err: any) {
      log.error(`Failed to track deployment ${deploymentId}:`, err);
    }
  }
}
