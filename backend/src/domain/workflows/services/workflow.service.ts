import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Client, ScheduleAlreadyRunning } from '@temporalio/client';
import { NativeConnection, Worker } from '@temporalio/worker';
import { WorkerEntity } from 'src/domain/database';
import { DeploymentUpdateEntity } from 'src/domain/database';
import { is } from 'src/lib';
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
    const [connection, client] = await this.temporal.getClient();

    await this.configureDeployment(connection, client, this.explorer.activities);
    await this.configureBilling(connection, client, this.explorer.activities);
    await this.configureChecks(connection, client, this.explorer.activities);
  }

  private async configureDeployment(connection: NativeConnection, client: Client, activities: Record<string, any>) {
    const deploymentWorker = await Worker.create({
      workflowsPath: require.resolve('./../workflows'),
      activities,
      taskQueue: `deployments`,
      connection: connection,
    });

    this.workers.push(deploymentWorker.runUntil(this.signal.promise));

    await this.tryRegister(() =>
      client.schedule.create({
        scheduleId: 'cleanup-deployments-usage',
        spec: {
          intervals: [
            {
              every: '12h',
            },
          ],
        },
        action: {
          args: [],
          type: 'startWorkflow',
          workflowId: 'cleanup-deployments-usages',
          workflowType: workflows.cleanupDeploymentsUsages,
          taskQueue: 'deployments',
        },
      }),
    );
  }

  private async configureChecks(connection: NativeConnection, client: Client, activities: Record<string, any>) {
    const checksWorker = await Worker.create({
      workflowsPath: require.resolve('./../workflows'),
      activities,
      taskQueue: `checks`,
      connection: connection,
    });

    this.workers.push(checksWorker.runUntil(this.signal.promise));

    await this.tryRegister(() =>
      client.schedule.create({
        scheduleId: 'track-deployments-healths',
        spec: {
          intervals: [
            {
              every: '15m',
            },
          ],
        },
        action: {
          args: [],
          type: 'startWorkflow',
          workflowId: 'track-deployments-healths',
          workflowType: workflows.trackDeploymentsHealths,
          taskQueue: 'checks',
        },
      }),
    );

    await this.tryRegister(() =>
      client.schedule.create({
        scheduleId: 'cleanup-deployments-checks',
        spec: {
          intervals: [
            {
              every: '12h',
            },
          ],
        },
        action: {
          args: [],
          type: 'startWorkflow',
          workflowId: 'cleanup-deployments-checks',
          workflowType: workflows.cleanupDeploymentsUsages,
          taskQueue: 'checks',
        },
      }),
    );
  }

  private async configureBilling(connection: NativeConnection, client: Client, activities: Record<string, any>) {
    const usageWorker = await Worker.create({
      workflowsPath: require.resolve('./../workflows'),
      activities,
      taskQueue: `billing`,
      connection,
    });

    this.workers.push(usageWorker.runUntil(this.signal.promise));

    await this.tryRegister(() =>
      client.schedule.create({
        scheduleId: 'track-deployments-usage-schedule',
        spec: {
          intervals: [
            {
              every: '1h',
            },
          ],
        },
        action: {
          args: [],
          type: 'startWorkflow',
          workflowId: 'track-deployments-usage',
          workflowType: workflows.trackDeploymentsUsage,
          taskQueue: 'billing',
        },
        policies: {
          catchupWindow: '30d',
        },
      }),
    );

    await this.tryRegister(() =>
      client.schedule.create({
        scheduleId: 'charge-deployments-schedule',
        spec: {
          calendars: [
            {
              dayOfMonth: 5,
            },
          ],
        },
        action: {
          type: 'startWorkflow',
          workflowId: 'charge-deployments',
          workflowType: workflows.chargeDeployments,
          taskQueue: 'billing',
        },
      }),
    );
  }

  private async tryRegister(action: () => Promise<any>) {
    try {
      await action();
    } catch (ex) {
      if (!is(ex, ScheduleAlreadyRunning)) {
        throw ex;
      }
    }
  }

  async onApplicationShutdown(signal: string) {
    this.signal.signal();

    this.logger.log(`Shutting down Temporal workers due to signal: ${signal}`);
    await Promise.all(this.workers);
    this.logger.log(`Workers shut down successfully.`);
  }

  async createDeployment(
    deploymentId: number,
    deploymentUpdate: DeploymentUpdateEntity,
    previousUpdate: DeploymentUpdateEntity | null,
    worker: WorkerEntity,
  ) {
    const [, client] = await this.temporal.getClient();

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
            previousResourceIds: previousUpdate?.serviceVersion.definition.resources.map((x) => x.id) || null,
            resourceIds: deploymentUpdate.serviceVersion.definition.resources.map((x) => x.id),
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
    const [, client] = await this.temporal.getClient();

    await client.workflow.signalWithStart<typeof workflows.deploymentCoordinator, [DeploymentSignal]>(
      workflows.deploymentCoordinator,
      {
        workflowId: `deployment-${deploymentId}`,
        args: [{ deploymentId }],
        signal: DEPLOYMENT_ACTION_SIGNAL,
        signalArgs: [
          {
            action: 'Destroy',
            resourceIds: deploymentUpdate.serviceVersion.definition.resources.map((x) => x.id),
            updateId: deploymentUpdate.id,
            workerApiKey: worker.apiKey,
            workerEndpoint: worker.endpoint,
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
