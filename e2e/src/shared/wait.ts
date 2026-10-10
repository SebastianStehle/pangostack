import { DeploymentDto, DeploymentDtoStatusEnum, ResponseError } from 'src/api/generated';
import { Clients } from './clients';
import { config } from './config';

const POLL_INTERVAL_MS = 1000;

// Polls instead of sleeping, because deployments run asynchronously in Temporal.
export async function waitForDeployment(clients: Clients, deploymentId: number, expected: DeploymentDtoStatusEnum) {
  const deadline = Date.now() + config.deploymentTimeoutMs;

  let deployment: DeploymentDto | undefined;
  while (Date.now() < deadline) {
    deployment = await clients.deployments.getDeployment(deploymentId);
    if (deployment.status === expected) {
      return deployment;
    }

    // A final state other than the expected one never changes again, so fail fast with the reason.
    if (deployment.status === 'Completed' || deployment.status === 'Failed') {
      throw new Error(
        `Deployment ${deploymentId} is ${deployment.status}, expected ${expected}: ${await getStepErrors(clients, deploymentId)}`,
      );
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error(
    `Deployment ${deploymentId} did not become ${expected} within ${config.deploymentTimeoutMs}ms, last status: ${deployment?.status}.`,
  );
}

export async function waitForDeploymentDeleted(clients: Clients, deploymentId: number) {
  const deadline = Date.now() + config.deploymentTimeoutMs;

  while (Date.now() < deadline) {
    try {
      await clients.deployments.getDeployment(deploymentId);
    } catch (ex) {
      if (ex instanceof ResponseError && ex.response.status === 404) {
        return;
      }
      throw ex;
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error(`Deployment ${deploymentId} was not deleted within ${config.deploymentTimeoutMs}ms.`);
}

async function getStepErrors(clients: Clients, deploymentId: number) {
  const { steps } = await clients.deployments.getDeploymentSteps(deploymentId);

  return steps
    .filter(({ error }) => !!error)
    .map(({ resourceId, error }) => `${resourceId}: ${error}`)
    .join(', ');
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
