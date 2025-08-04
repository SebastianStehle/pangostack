import { ActivityFailure, log, proxyActivities } from '@temporalio/workflow';
import { lastMonthEndUtcDate, lastMonthStartUtcDate } from 'src/lib/time';
import type * as activities from '../activities';

const { chargeDeployment, getDeployments } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 1,
  },
});

export async function chargeDeployments(): Promise<void> {
  const deployments = await getDeployments({});
  const dateFrom = lastMonthStartUtcDate();
  const dateTo = lastMonthEndUtcDate();

  for (const deploymentId of deployments) {
    try {
      await chargeDeployment({ deploymentId, dateFrom, dateTo });
    } catch (ex: any) {
      let cause = ex;
      if (ex instanceof ActivityFailure) {
        cause = ex.failure?.cause || cause;
      }

      log.error(`Failed to charge deployment ${deploymentId}.`, { cause });
    }
  }
}
