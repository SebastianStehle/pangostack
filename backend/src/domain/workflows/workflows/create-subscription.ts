import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { createSubscription: createSubscriptionActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function createSubscription({ deploymentId, teamId }: { deploymentId: number; teamId: number }): Promise<void> {
  await createSubscriptionActivity({ teamId, deploymentId });
}
