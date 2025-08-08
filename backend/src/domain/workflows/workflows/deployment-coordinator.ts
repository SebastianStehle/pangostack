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

    const { action, previousResources, previousUpdateId, resources, updateId, workerApiKey, workerEndpoint } = newAction;

    if (action === 'Update') {
      await executeChild(deployResources, {
        workflowId: `deployment-${deploymentId}-update-${updateId}`,
        args: [
          {
            previousResources,
            previousUpdateId,
            deploymentId,
            resources,
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
            resources,
            updateId,
            workerApiKey,
            workerEndpoint,
          },
        ],
      });
    }
  }
}
