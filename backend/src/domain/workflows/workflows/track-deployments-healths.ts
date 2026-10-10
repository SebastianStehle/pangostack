import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { TRACKING_RETRY_POLICY } from '../constants';

const { getDeployments } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: TRACKING_RETRY_POLICY,
});

// Each health check URL is retried several times with timeouts inside the activity.
const { trackDeploymentHealth } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2m',
  retry: TRACKING_RETRY_POLICY,
});

export async function trackDeploymentsHealths(): Promise<void> {
  const deployments = await getDeployments({});

  for (const { id: deploymentId } of deployments) {
    try {
      // Health changes are announced by the activity via events.
      await trackDeploymentHealth({ deploymentId });
    } catch (ex) {
      log.error(`Failed to check deployment ${deploymentId}.`, { cause: ex });
    }
  }
}
