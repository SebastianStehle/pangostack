import { executeChild, log, sleep } from '@temporalio/workflow';
import { parseCronExpression } from 'cron-schedule';
import { todayUtcDate } from 'src/lib/time';
import { trackDeploymentsUsage } from './track-deployments-usage';

export async function trackDeploymentsUsageCoordinator(): Promise<void> {
  const cronExpression = parseCronExpression('*/5 * * * *');
  while (true) {
    try {
      const trackDate = todayUtcDate();
      const trackHour = new Date().getUTCHours();

      await executeChild(trackDeploymentsUsage, {
        workflowId: `track-usage-${trackDate}-update-${trackHour}`,
        args: [
          {
            trackDate,
            trackHour,
          },
        ],
      });
    } catch (ex) {
      log.error('Failed to execute child workflow', { ex });
    }

    const now = new Date();
    const next = cronExpression.getNextDate(now);

    const delayMs = next.getTime() - now.getTime();
    if (delayMs > 0) {
      await sleep(delayMs);
    }
  }
}
