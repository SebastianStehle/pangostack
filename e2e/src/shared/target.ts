import { execFileSync } from 'child_process';
import { config } from './config';

// The worker names compose projects after the resource ID, which is built from the deployment and resource.
export function getComposeProject(deploymentId: number, resourceId: string) {
  return `deployment_${deploymentId}_${resourceId}`;
}

// Looks into the docker-target container directly, because deleted deployments cannot be queried through the API.
export function getTargetContainers(project: string) {
  const containerId = docker([
    'ps',
    '-q',
    '--filter',
    `label=com.docker.compose.project=${config.composeProject}`,
    '--filter',
    'label=com.docker.compose.service=docker-target',
  ]);
  if (!containerId) {
    throw new Error(`The docker-target container of compose project '${config.composeProject}' is not running.`);
  }

  const output = docker([
    'exec',
    containerId,
    'docker',
    'ps',
    '-a',
    '--filter',
    `label=com.docker.compose.project=${project}`,
    '--format',
    '{{.Names}}',
  ]);

  return output.split('\n').filter((name) => name.length > 0);
}

function docker(args: string[]) {
  return execFileSync('docker', args, { encoding: 'utf8' }).trim();
}
