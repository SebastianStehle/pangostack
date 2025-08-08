import { defineSignal } from '@temporalio/workflow';
import { ResourceDefinition } from 'src/domain/definitions';

type DeploymentAction = 'Update' | 'Destroy';

export interface DeploymentSignal {
  action: DeploymentAction;
  previousResources?: ResourceDefinition[] | null;
  previousUpdateId?: number | null;
  resources: ResourceDefinition[];
  updateId: number;
  workerApiKey?: string;
  workerEndpoint: string;
}

export const DEPLOYMENT_ACTION_SIGNAL = 'deploymentAction';

export const signalDeploymentAction = defineSignal<[DeploymentSignal]>(DEPLOYMENT_ACTION_SIGNAL);
