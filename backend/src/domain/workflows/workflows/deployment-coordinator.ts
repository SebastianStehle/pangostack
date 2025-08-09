import { condition, executeChild, setHandler } from '@temporalio/workflow';
import { deleteResources } from './delete-resources';
import { deployResources } from './deploy-resources';
import { DeploymentSignal, signalDeploymentAction } from './signals';

export async function deploymentCoordinator({ deploymentId }: { deploymentId: number }) {
  const queue: DeploymentSignal[] = [];
  setHandler(signalDeploymentAction, async (newAction) => {
    queue.push(newAction);
  });

  // Wait until the queue has at least one item
  await condition(() => queue.length > 0);

  while (queue.length > 0) {
    const newAction = queue.shift();
    if (!newAction) {
      break;
    }

    const { action, previousResourceIds, previousUpdateId, resourceIds, updateId, workerApiKey, workerEndpoint } = newAction;

    if (action === 'Update') {
      await executeChild(deployResources, {
        workflowId: `deployment-${deploymentId}-update-${updateId}`,
        args: [
          {
            previousResourceIds,
            previousUpdateId,
            deploymentId,
            resourceIds,
            updateId,
            workerApiKey,
            workerEndpoint,
          },
        ],
      });
    } else {
      await executeChild(deleteResources, {
        workflowId: `deployment-${deploymentId}-delete`,
        args: [
          {
            deploymentId,
            resourceIds,
            updateId,
            workerApiKey,
            workerEndpoint,
          },
        ],
      });
    }
  }
}
