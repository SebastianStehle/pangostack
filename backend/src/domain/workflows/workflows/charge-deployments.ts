import { ActivityFailure, log, proxyActivities } from '@temporalio/workflow';
import { lastMonthEndUtcDate, lastMonthStartUtcDate } from 'src/lib/helpers/time';
import type * as activities from '../activities';
import { BILLING_RETRY_POLICY, TRACKING_RETRY_POLICY } from '../constants';

const { chargeDeployment, getDeployments } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: BILLING_RETRY_POLICY,
});

const { reportBillingFailures } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: TRACKING_RETRY_POLICY,
});

export async function chargeDeployments(): Promise<void> {
  const deployments = await getDeployments({});
  const dateFrom = lastMonthStartUtcDate();
  const dateTo = lastMonthEndUtcDate();

  const failures: { deploymentId: number; error: string }[] = [];
  for (const { id: deploymentId } of deployments) {
    try {
      await chargeDeployment({ deploymentId, dateFrom, dateTo });
    } catch (ex: any) {
      let cause = ex;
      if (ex instanceof ActivityFailure) {
        cause = ex.cause || cause;
      }

      log.error(`Failed to charge deployment ${deploymentId}.`, { cause });
      failures.push({ deploymentId, error: cause?.message || 'Unknown error' });
    }
  }

  if (failures.length === 0) {
    return;
  }

  // One summary per run, because a billing provider outage fails all deployments at once.
  await reportBillingFailures({ dateFrom, dateTo, failures });
}
