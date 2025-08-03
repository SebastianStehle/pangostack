/*import { WorkflowExecutionAlreadyStartedError } from '@temporalio/common';
import { executeChild, WorkflowIdReusePolicy } from '@temporalio/workflow';
import { todayUtcDate } from 'src/lib/time';
import { trackDeploymentsUsage } from './track-deployments-usage';

export async function trackDeploymentsUsageCoordinator(): Promise<void> {
  const trackDate = todayUtcDate();
  const trackHour = new Date().getUTCHours();

  try {
    await executeChild(trackDeploymentsUsage, {
      workflowId: `track-usage-${trackDate}-update-${trackHour}`,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE,
      args: [
        {
          trackDate,
          trackHour,
        },
      ],
    });
  } catch (ex) {
    if (!is(ex, WorkflowExecutionAlreadyStartedError)) {
      throw ex;
    }
  }
}

function is<TClass>(x: any, c: new (...args: any[]) => TClass): x is TClass {
  return x instanceof c;
}*/

export const FOO = '123';
