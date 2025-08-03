import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { WorkflowIdConflictPolicy } from '@temporalio/common';
import { Worker } from '@temporalio/worker';
import { WorkflowIdReusePolicy } from '@temporalio/workflow';
import { WorkerEntity } from 'src/domain/database';
import { DeploymentUpdateEntity } from 'src/domain/database';
import { ActivityExplorerService } from '../registration';
import * as workflows from '../workflows';
import { DEPLOYMENT_ACTION_SIGNAL, DeploymentSignal } from '../workflows/signals';
import { TemporalService } from './temporal.service';

@Injectable()
export class WorkflowService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(WorkflowService.name);
  private readonly signal = new ShutdownSignal();
  private readonly workers: Promise<any>[] = [];

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

    this.workers.push(deploymentWorker.runUntil(this.signal.promise));

    const usageWorker = await Worker.create({
      workflowsPath: require.resolve('./../workflows'),
      activities,
      taskQueue: `billing`,
    });

    this.workers.push(usageWorker.runUntil(this.signal.promise));

    const client = this.temporal.client;
    await client.workflow.start(workflows.trackDeploymentsUsageCoordinator, {
      workflowId: 'track-usage',
      workflowIdConflictPolicy: WorkflowIdConflictPolicy.TERMINATE_EXISTING,
      args: [],
      taskQueue: `billing`,
    });

    await client.workflow.start(workflows.chargeDeployments, {
      cronSchedule: '0 0 5 * *',
      workflowId: 'charge-usage',
      workflowIdConflictPolicy: WorkflowIdConflictPolicy.TERMINATE_EXISTING,
      args: [],
      taskQueue: `billing`,
    });
  }

  async onApplicationShutdown(signal: string) {
    this.signal.signal();

    this.logger.log(`Shutting down Temporal workers due to signal: ${signal}`);
    await Promise.all(this.workers);
    this.logger.log(`Workers shut down successfully.`);
  }

  async createSubscription(deploymentId: number, teamId: number) {
    const client = this.temporal.client;
    await client.workflow.start(workflows.createSubscription, {
      args: [{ deploymentId, teamId }],
      taskQueue: `deployments`,
      workflowId: `subscribe-${deploymentId}`,
      workflowIdReusePolicy: WorkflowIdReusePolicy.REJECT_DUPLICATE,
    });
  }

  async createDeployment(
    deploymentId: number,
    deploymentUpdate: DeploymentUpdateEntity,
    previousUpdate: DeploymentUpdateEntity | null,
    teamId: number,
    worker: WorkerEntity,
  ) {
    const client = this.temporal.client;

    await client.workflow.signalWithStart<typeof workflows.deploymentCoordinator, [DeploymentSignal]>(
      workflows.deploymentCoordinator,
      {
        workflowId: `deployment-${deploymentId}`,
        args: [{ deploymentId }],
        signal: DEPLOYMENT_ACTION_SIGNAL,
        signalArgs: [
          {
            action: 'Update',
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
      },
    );

    if (!previousUpdate) {
    }
  }

  async deleteDeployment(deploymentId: number, deploymentUpdate: DeploymentUpdateEntity, worker: WorkerEntity) {
    const client = this.temporal.client;

    await client.workflow.signalWithStart<typeof workflows.deploymentCoordinator, [DeploymentSignal]>(
      workflows.deploymentCoordinator,
      {
        workflowId: `deployment-${deploymentId}`,
        args: [{ deploymentId }],
        signal: DEPLOYMENT_ACTION_SIGNAL,
        signalArgs: [
          {
            action: 'Destroy',
            resources: deploymentUpdate.serviceVersion.definition.resources,
            updateId: deploymentUpdate.id,
            workerApiKey: worker.apiKey,
            workerEndpoint: worker.endpoint,
            teamId: 0,
          },
        ],
        taskQueue: `deployments`,
      },
    );
  }
}

class ShutdownSignal {
  private resolveFn!: () => void;
  private signaled = false;

  public readonly promise: Promise<void>;

  get isSignaled() {
    return this.signaled;
  }

  constructor() {
    this.promise = new Promise<void>((resolve) => {
      this.resolveFn = () => {
        if (!this.signaled) {
          this.signaled = true;
          resolve();
        }
      };
    });
  }

  signal(): void {
    this.resolveFn();
  }
}
