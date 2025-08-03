import { Context } from '@temporalio/activity';
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

export interface TrackUsageParam {}

const { getWorker, getDeployments, trackDeployment } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
  retry: {
    maximumAttempts: 5,
  },
});

export async function trackUsage(): Promise<void> {
  const { workerApiKey, workerEndpoint } = await getWorker({});
  const deployments = await getDeployments({});

  const utcNow = new Date();
  const trackDate = new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), utcNow.getUTCDate()));
  const trackHour = utcNow.getUTCHours();

  const context = Context.current();
  for (const deploymentId of deployments) {
    try {
      await trackDeployment({
        deploymentId,
        trackDate,
        trackHour,
        workerApiKey,
        workerEndpoint,
      });
    } catch (err: any) {
      context.log.error(`Failed to track deployment ${deploymentId}:`, err);
    }
  }
}
