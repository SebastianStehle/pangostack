import { condition, executeChild, setHandler } from '@temporalio/workflow';
import { deleteDeployment } from './delete-deployment';
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

    const { action, previousResourceIds, previousUpdateId, resourceIds, updateId } = newAction;

    if (action === 'Update') {
      await executeChild(deployResources, {
        workflowId: `deployment-resource-${deploymentId}-update-${updateId}`,
        args: [
          {
            previousResourceIds,
            previousUpdateId,
            deploymentId,
            resourceIds,
            updateId,
          },
        ],
      });
    } else {
      await executeChild(deleteResources, {
        workflowId: `deployment-resource-${deploymentId}-delete`,
        args: [
          {
            deploymentId,
            resourceIds,
            updateId,
          },
        ],
      });

      await executeChild(deleteDeployment, {
        workflowId: `deployment-${deploymentId}-delete`,
        args: [
          {
            deploymentId,
          },
        ],
      });
    }
  }
}
