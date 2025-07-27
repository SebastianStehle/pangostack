import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { ResourceDefinition } from '../model';

export interface DeployAllParam {
  deploymentId: number;
  resources: ResourceDefinition[];
  updateId: number;
  workerApiKey: string;
  workerEndpoint: string;
}

const { deleteResource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 minutes',
});

export async function deleteAll({
  deploymentId,
  resources,
  updateId,
  workerApiKey,
  workerEndpoint,
}: DeployAllParam): Promise<void> {
  for (const resource of resources) {
    await deleteResource({
      workerApiKey,
      workerEndpoint,
      resource,
      deploymentId,
      updateId,
    });
  }
}
