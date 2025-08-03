import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Worker } from '@temporalio/worker';
import { WorkflowIdReusePolicy } from '@temporalio/workflow';
import { DeploymentEntity, WorkerEntity } from 'src/domain/database';
import { DeploymentUpdateEntity } from 'src/domain/database';
import { ActivityExplorerService } from '../registration';
import * as workflows from '../workflows';
import { TemporalService } from './temporal.service';

@Injectable()
export class WorkflowService implements OnApplicationBootstrap {
  constructor(
    private readonly temporal: TemporalService,
    private readonly explorer: ActivityExplorerService,
  ) {}

  async onApplicationBootstrap() {
    const activities = this.explorer.activities;

    const deploymentWorker = await Worker.create({
      workflowsPath: require.resolve('./../workflows'),
      activities,
      taskQueue: `deployments`,
    });

    deploymentWorker.run();

    const usageWorker = await Worker.create({
      workflowsPath: require.resolve('./../workflows'),
      activities,
      taskQueue: `usage`,
    });

    usageWorker.run();

    const client = this.temporal.client;
    await client.workflow.start(workflows.trackUsage, {
      cronSchedule: '0 * * * *',
      workflowId: 'track-usage',
      args: [],
      taskQueue: `usage`,
    });
  }

  async createDeployment(
    deployment: DeploymentEntity,
    deploymentUpdate: DeploymentUpdateEntity,
    previousUpdate: DeploymentUpdateEntity | null,
    teamId: number,
    worker: WorkerEntity,
  ) {
    const client = this.temporal.client;
    await client.workflow.start(workflows.deployResources, {
      workflowId: `deployment-${deployment.id}`,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE,
      args: [
        {
          deploymentId: deployment.id,
          previousUpdateId: deploymentUpdate?.id || null,
          previousResources: previousUpdate?.serviceVersion.definition.resources || null,
          resources: deploymentUpdate.serviceVersion.definition.resources,
          teamId,
          updateId: deploymentUpdate.id,
          workerApiKey: worker.apiKey,
          workerEndpoint: worker.endpoint,
        },
      ],
      taskQueue: `deployments`,
    });
  }

  async deleteDeployment(deployment: DeploymentEntity, deploymentUpdate: DeploymentUpdateEntity, worker: WorkerEntity) {
    const client = this.temporal.client;
    await client.workflow.start(workflows.deleteResources, {
      workflowId: `deployment-${deployment.id}`,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE,
      args: [
        {
          deploymentId: deployment.id,
          resources: deploymentUpdate.serviceVersion.definition.resources,
          updateId: deploymentUpdate.id,
          workerApiKey: worker.apiKey,
          workerEndpoint: worker.endpoint,
        },
      ],
      taskQueue: `deployments`,
    });
  }
}
