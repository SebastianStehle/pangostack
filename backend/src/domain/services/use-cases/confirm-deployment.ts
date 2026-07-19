import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
import { DeploymentConfirmedEvent, SubscriptionCreatedEvent } from 'src/domain/events';
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
    private readonly events: EventEmitter2,
  ) {}

  async execute(command: ConfirmDeployment): Promise<any> {
    const { deploymentId, teamId, token } = command;

    const deployment = await this.deployments.findOne({ where: { id: deploymentId, teamId } });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (deployment.status !== 'Pending' || deployment.confirmToken !== token) {
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

    await this.workflows.createDeployment(deployment.id, lastUpdate, null);

    // The confirmation happens through a payment provider redirect, so there is no acting user.
    this.events.emit(SubscriptionCreatedEvent.TYPE, new SubscriptionCreatedEvent(teamId, deployment.id, deployment.name));
    this.events.emit(DeploymentConfirmedEvent.TYPE, new DeploymentConfirmedEvent(teamId, deployment.id, deployment.name));
  }
}
