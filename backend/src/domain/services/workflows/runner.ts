import { Injectable } from '@nestjs/common';
import { Worker } from '@temporalio/worker';
import { WorkflowIdReusePolicy } from '@temporalio/workflow';
import { plainToInstance } from 'class-transformer';
import { parse as fromYAML } from 'yaml';
import { DeploymentEntity, ServiceVersionEntity, WorkerEntity } from 'src/domain/database';
import { DeploymentUpdateEntity } from 'src/domain/database/entities/deployment-update';
import { TemporalService } from 'src/lib';
import * as activities from './activities';
import { ResourcesDefinition } from './model';
import * as workflows from './workflows';

@Injectable()
export class WorkflowRunner {
  private workerCreated = false;

  constructor(
    private readonly temporal: TemporalService,
    private readonly deployResource: activities.DeployResourceActivity,
    private readonly updateDeployment: activities.UpdateDeploymentActivity,
  ) {}

  async deploy(
    deployment: DeploymentEntity,
    deploymentUpdate: DeploymentUpdateEntity,
    serviceVersion: ServiceVersionEntity,
    worker: WorkerEntity,
  ) {
    const client = this.temporal.client;

    const taskQueue = `deployments`;
    await this.ensureCreated(taskQueue);

    const definitionJson = fromYAML(serviceVersion.definition);
    const definitionClass = plainToInstance(ResourcesDefinition, definitionJson);

    await client.workflow.start(workflows.deployAll, {
      workflowId: `deployment-${deployment.id}`,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE,
      args: [
        {
          deploymentId: deployment.id,
          resources: definitionClass.resources,
          updateId: deploymentUpdate.id,
          workerApiKey: worker.apiKey,
          workerEndpoint: worker.endpoint,
        },
      ],
      taskQueue,
    });
  }

  async delete(
    deployment: DeploymentEntity,
    deploymentUpdate: DeploymentUpdateEntity,
    serviceVersion: ServiceVersionEntity,
    worker: WorkerEntity,
  ) {
    const client = this.temporal.client;

    const taskQueue = `deployments`;
    await this.ensureCreated(taskQueue);

    const definitionJson = fromYAML(serviceVersion.definition);
    const definitionClass = plainToInstance(ResourcesDefinition, definitionJson);

    await client.workflow.start(workflows.deployAll, {
      workflowId: `deployment-${deployment.id}`,
      workflowIdReusePolicy: WorkflowIdReusePolicy.ALLOW_DUPLICATE,
      args: [
        {
          deploymentId: deployment.id,
          resources: definitionClass.resources,
          updateId: deploymentUpdate.id,
          workerApiKey: worker.apiKey,
          workerEndpoint: worker.endpoint,
        },
      ],
      taskQueue,
    });
  }

  private async ensureCreated(taskQueue: string) {
    if (!this.workerCreated) {
      const worker = await Worker.create({
        workflowsPath: require.resolve('./workflows'),
        activities: {
          deployResource: this.deployResource.execute.bind(this.deployResource),
          updateDeployment: this.updateDeployment.execute.bind(this.updateDeployment),
        },
        taskQueue,
      });

      worker.run();
      this.workerCreated = true;
    }
  }
}
