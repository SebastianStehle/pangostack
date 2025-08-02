import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Worker } from '@temporalio/worker';
import { WorkflowIdReusePolicy } from '@temporalio/workflow';
import { DeploymentEntity, WorkerEntity } from 'src/domain/database';
import { DeploymentUpdateEntity } from 'src/domain/database/entities/deployment-update';
import * as activities from '../activities';
import * as workflows from '../workflows';
import { TemporalService } from './temporal.service';

@Injectable()
export class WorkflowService implements OnApplicationBootstrap {
  constructor(
    private readonly temporal: TemporalService,
    private readonly createSubscription: activities.CreateSubscriptionActivity,
    private readonly deleteResource: activities.DeleteResourceActivity,
    private readonly deployResource: activities.DeployResourceActivity,
    private readonly updateDeployment: activities.UpdateDeploymentActivity,
  ) {}

  async onApplicationBootstrap() {
    const worker = await Worker.create({
      workflowsPath: require.resolve('./../workflows'),
      activities: {
        createSubscription: this.createSubscription.execute.bind(this.createSubscription),
        deleteResource: this.deleteResource.execute.bind(this.deleteResource),
        deployResource: this.deployResource.execute.bind(this.deployResource),
        updateDeployment: this.updateDeployment.execute.bind(this.updateDeployment),
      },
      taskQueue: `deployments`,
    });

    worker.run();
  }

  async deploy(
    deployment: DeploymentEntity,
    deploymentUpdate: DeploymentUpdateEntity,
    previousUpdate: DeploymentUpdateEntity | null,
    teamId: number,
    worker: WorkerEntity,
  ) {
    const client = this.temporal.client;

    await client.workflow.start(workflows.deployAll, {
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

  async delete(deployment: DeploymentEntity, deploymentUpdate: DeploymentUpdateEntity, worker: WorkerEntity) {
    const client = this.temporal.client;

    await client.workflow.start(workflows.deleteAll, {
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
