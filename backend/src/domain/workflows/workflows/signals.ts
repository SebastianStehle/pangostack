import { defineSignal } from '@temporalio/workflow';

type DeploymentAction = 'Update' | 'Destroy';

export interface DeploymentSignal {
  action: DeploymentAction;
  previousResourceIds?: string[] | null;
  previousUpdateId?: number | null;
  resourceIds: string[];
  updateId: number;
}

export const DEPLOYMENT_ACTION_SIGNAL = 'deploymentAction';

export const signalDeploymentAction = defineSignal<[DeploymentSignal]>(DEPLOYMENT_ACTION_SIGNAL);
