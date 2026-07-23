import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan } from 'typeorm';
import {
  DeploymentCheckEntity,
  DeploymentCheckRepository,
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  ServiceVersionEntity,
  ServiceVersionRepository,
} from 'src/domain/database';
import { User } from 'src/domain/users';
import { WorkerResolver } from 'src/domain/workers';
import { WorkflowService } from 'src/domain/workflows';
import { Deployment } from '../interfaces';
import { DeploymentPolicy } from '../policies';
import { buildDeployment } from './utils';

export class RetryDeployment extends Command<RetryDeploymentResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
    public readonly user: User,
  ) {
    super();
  }
}

export class RetryDeploymentResult {
  constructor(public readonly deployment: Deployment) {}
}

@CommandHandler(RetryDeployment)
export class RetryDeploymentHandler implements ICommandHandler<RetryDeployment, RetryDeploymentResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
    private readonly workerResolver: WorkerResolver,
    private readonly workflows: WorkflowService,
  ) {}

  async execute(command: RetryDeployment): Promise<RetryDeploymentResult> {
    const { deploymentId, policy } = command;

    const deployment = await this.deployments.findOne({ where: { id: deploymentId } });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy.isAllowed(deployment)) {
      throw new ForbiddenException();
    }

    const lastUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion', 'serviceVersion.service'],
    });
    if (!lastUpdate) {
      throw new NotFoundException(`Deployment ${deploymentId} was never really created`);
    }

    if (lastUpdate.status !== 'Failed') {
      throw new BadRequestException(`Deployment ${deploymentId} is not in a failed state and cannot be retried.`);
    }

    // The last successful update provides the resource IDs to diff against, so resources removed by the
    // failed update are still deleted on retry. Null when the very first deployment failed.
    const previousUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId, status: 'Completed' },
      order: { id: 'DESC' },
      relations: ['serviceVersion', 'serviceVersion.service'],
    });

    const workers = await this.workerResolver.getWorkers();
    if (workers.size === 0) {
      throw new NotFoundException('No worker available.');
    }

    // Re-trigger the deployment workflow for the same update instead of creating a new one. The deploy
    // activities are idempotent and the workflow re-plans its steps (see createDeploymentSteps), so
    // already-created resources are skipped and the failed step is retried.
    await this.workflows.createDeployment(deployment.id, lastUpdate, previousUpdate);

    // Reflect the restarted attempt immediately, so the UI leaves the failed state without waiting for
    // the workflow to report back. The workflow moves it to Running and then Completed or Failed.
    await this.deploymentUpdates.update(lastUpdate.id, { status: 'Pending' });
    lastUpdate.status = 'Pending';

    const lastCheck = await this.deploymentChecks.findOne({
      where: { deploymentId: deployment.id },
      order: { id: 'DESC' },
    });

    const versions = await this.serviceVersions.find({
      where: { serviceId: deployment.serviceId, name: MoreThan(lastUpdate.serviceVersion.name), isActive: true },
      order: { name: 'ASC' },
    });

    return new RetryDeploymentResult(buildDeployment(deployment, versions, lastUpdate, lastCheck));
  }
}
