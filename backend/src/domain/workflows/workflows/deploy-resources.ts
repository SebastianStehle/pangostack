import { proxyActivities } from '@temporalio/workflow';
import type { DeploymentStepKey } from 'src/domain/database';
import { Topics } from 'src/domain/notifications/topics';
import type * as activities from '../activities';
import { DEPLOYMENT_STEP_MAX_ATTEMPTS } from '../constants';

export interface DeployResourcesParam {
  deploymentId: number;
  previousResourceIds?: string[] | null;
  previousUpdateId?: number | null;
  resourceIds: string[];
  updateId: number;
}

const { deleteResource, deployResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '15m',
  retry: {
    maximumAttempts: DEPLOYMENT_STEP_MAX_ATTEMPTS,
    initialInterval: '1m',
  },
});

const { createDeploymentSteps, failDeploymentStep, updateDeployment, getDeployment, getWorker, notify } = proxyActivities<
  typeof activities
>({
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
  updateId,
}: DeployResourcesParam): Promise<any> {
  await updateDeployment({ updateId, status: 'Running' });

  const { workerApiKey, workerEndpoint } = await getWorker({});

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
        workerApiKey,
        workerEndpoint,
      });
    }

    for (const resourceId of resourceIds) {
      currentStepId = stepIdOf({ resourceId, action: 'Deploy' });

      await deployResource({
        deploymentId,
        resourceId,
        stepId: currentStepId,
        updateId,
        workerApiKey,
        workerEndpoint,
      });
    }
    await updateDeployment({ updateId, status: 'Completed' });
  } catch (ex) {
    deployError = ex;

    if (currentStepId) {
      await failDeploymentStep({ stepId: currentStepId, error: `${ex}` });
    }

    await updateDeployment({ updateId, status: 'Failed', error: `${ex}` });
  }

  const deployment = await getDeployment({ id: deploymentId });
  if (!deployment) {
    if (deployError) {
      throw deployError;
    }
    return;
  }

  const deploymentProperties: Record<string, string> = Object.fromEntries(
    Object.entries(deployment).map(([key, value]) => [key, String(value)]),
  );

  const topic = Topics.team(deployment.teamId);
  if (deployError) {
    // Re-throw so Temporal marks this workflow run as failed.
    throw deployError;
  } else if (previousResourceIds) {
    await notify({
      topic,
      templateCode: 'DEPLOYMENT_UPDATED',
      properties: {
        ...deploymentProperties,
      },
      url: deployment.url,
    });
  } else {
    await notify({
      topic,
      templateCode: 'DEPLOYMENT_CREATED',
      properties: {
        ...deploymentProperties,
      },
      url: deployment.url,
    });
  }
}
