import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { BillingService } from 'src/domain/billing';
import {
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  WorkerEntity,
  WorkerRepository,
} from 'src/domain/database';
import { WorkflowService } from 'src/domain/workflows';

export class ConfirmDeployment {
  constructor(
    public readonly teamId: number,
    public readonly deploymentId: number,
    public readonly token: string,
  ) {}
}

@CommandHandler(ConfirmDeployment)
export class ConfirmDeploymentHandler implements ICommandHandler<ConfirmDeployment> {
  constructor(
    private readonly billingService: BillingService,
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
    private readonly workflows: WorkflowService,
  ) {}

  async execute(command: ConfirmDeployment): Promise<any> {
    const { deploymentId, teamId, token } = command;

    const deployment = await this.deployments.findOne({ where: { id: deploymentId, teamId } });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (deployment.status !== 'Created' || deployment.confirmToken !== token) {
      throw new ForbiddenException();
    }

    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    if (!this.billingService.hasSubscription(teamId, deploymentId)) {
      throw new BadRequestException('Subscription has not been created.');
    }

    deployment.status = 'Created';
    await this.deployments.save(deployment);

    const lastUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion', 'serviceVersion.service'],
    });
    if (!lastUpdate) {
      throw new NotFoundException(`Deployment ${deploymentId} was never really created`);
    }

    await this.workflows.createDeployment(deployment.id, lastUpdate, null, worker);
  }
}
