import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { getDeployments, trackDeploymentHealth } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function trackDeploymentsHealths(): Promise<void> {
  const deployments = await getDeployments({});

  for (const deploymentId of deployments) {
    try {
      await trackDeploymentHealth({ deploymentId });
    } catch (err: any) {
      log.error(`Failed to check deployment ${deploymentId}:`, err);
    }
  }
}
