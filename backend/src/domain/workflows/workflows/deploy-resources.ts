import { ActivityFailure, proxyActivities } from '@temporalio/workflow';
import type { DeploymentStepKey } from 'src/domain/database';
import type * as activities from '../activities';
import { DEPLOYMENT_STEP_MAX_ATTEMPTS } from '../constants';

export interface DeployResourcesParam {
  deploymentId: number;
  previousResourceIds?: string[] | null;
  previousUpdateId?: number | null;
  resourceIds: string[];
  stepMaxAttempts?: number | null;
  updateId: number;
}

const { createDeploymentSteps, failDeploymentStep, updateDeployment, getResourceWorkers } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
  retry: {
    maximumAttempts: 3,
  },
});

export async function deployResources({
  deploymentId,
  previousResourceIds,
  previousUpdateId,
  resourceIds,
  stepMaxAttempts,
  updateId,
}: DeployResourcesParam): Promise<any> {
  // Workflows cannot read the configuration, so the attempts are passed in. Older signals do not have them.
  const { deleteResource, deployResource } = proxyActivities<typeof activities>({
    startToCloseTimeout: '15m',
    retry: {
      maximumAttempts: stepMaxAttempts || DEPLOYMENT_STEP_MAX_ATTEMPTS,
      initialInterval: '1m',
    },
  });

  await updateDeployment({ updateId, status: 'Running' });

  // Resources that are no longer part of the current definition are deleted first,
  // in reverse order to respect dependencies.
  const deletions: string[] = [];
  if (previousResourceIds && previousUpdateId) {
    for (const resourceId of [...previousResourceIds].reverse()) {
      if (resourceIds.indexOf(resourceId) < 0) {
        deletions.push(resourceId);
      }
    }
  }

  const plannedSteps: DeploymentStepKey[] = [
    ...deletions.map((resourceId) => ({ resourceId, action: 'Delete' }) as DeploymentStepKey),
    ...resourceIds.map((resourceId) => ({ resourceId, action: 'Deploy' }) as DeploymentStepKey),
  ];

  // Persist the full plan upfront, so the UI can show all steps before they run. The
  // created IDs are passed to the activities, so that they do not need any lookup logic.
  const { steps } = await createDeploymentSteps({ updateId, previousUpdateId, steps: plannedSteps });

  const stepIdOf = ({ action, resourceId }: DeploymentStepKey) => {
    return steps.find((x) => x.resourceId === resourceId && x.action === action)?.stepId;
  };

  // The deletions belong to the previous update and therefore need their own lookup, because their
  // resources are no longer part of the current definition.
  const deployWorkers = await getResourceWorkers({ resourceIds, updateId });
  const deleteWorkers =
    deletions.length > 0 ? await getResourceWorkers({ resourceIds: deletions, updateId: previousUpdateId! }) : {};

  let deployError: unknown = undefined;
  let currentStepId: number | undefined = undefined;
  try {
    for (const resourceId of deletions) {
      currentStepId = stepIdOf({ resourceId, action: 'Delete' });

      await deleteResource({
        deploymentId,
        resourceId,
        stepId: currentStepId,
        updateId: previousUpdateId!,
        workerEndpoint: deleteWorkers[resourceId],
      });
    }

    for (const resourceId of resourceIds) {
      currentStepId = stepIdOf({ resourceId, action: 'Deploy' });

      await deployResource({
        deploymentId,
        resourceId,
        stepId: currentStepId,
        updateId,
        workerEndpoint: deployWorkers[resourceId],
      });
    }
    await updateDeployment({ updateId, status: 'Completed' });
  } catch (ex) {
    deployError = ex;

    const error = getErrorMessage(ex);
    if (currentStepId) {
      await failDeploymentStep({ stepId: currentStepId, error });
    }

    await updateDeployment({ updateId, status: 'Failed', error });
  }

  // Re-throw so Temporal marks this workflow run as failed. Successful runs are announced by the updateDeployment activity.
  if (deployError) {
    throw deployError;
  }
}

// Temporal wraps errors from activities, but users need to see the original reason.
function getErrorMessage(error: unknown) {
  if (error instanceof ActivityFailure && error.cause) {
    return error.cause.message;
  }

  return `${error}`;
}
