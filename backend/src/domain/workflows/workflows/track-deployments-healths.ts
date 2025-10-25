import { log, proxyActivities } from '@temporalio/workflow';
import { Topics } from 'src/domain/notifications/topics';
import type * as activities from '../activities';

const { getDeployments, notify, trackDeploymentHealth } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function trackDeploymentsHealths(): Promise<void> {
  const deployments = await getDeployments({});

  for (const deployment of deployments) {
    const deploymentId = deployment.id;
    try {
      const result = await trackDeploymentHealth({ deploymentId });

      const deploymentProperties: Record<string, string> = Object.fromEntries(
        Object.entries(deployment).map(([key, value]) => [key, String(value)]),
      );

      if (result === 'BecomeDegraded') {
        await notify({
          topic: Topics.team(deployment.teamId),
          templateCode: 'DEPLOYMENT_UNHEALTHY',
          properties: {
            ...deploymentProperties,
          },
          url: deployment.url,
        });
      } else if (result === 'BecomeHealthy') {
        await notify({
          topic: Topics.team(deployment.teamId),
          templateCode: 'DEPLOYMENT_HEALTHY',
          properties: {
            ...deploymentProperties,
          },
          url: deployment.url,
        });
      }
    } catch (ex) {
      log.error(`Failed to check deployment ${deploymentId}.`, { cause: ex });
    }
  }
}
