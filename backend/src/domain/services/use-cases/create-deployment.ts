import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan } from 'typeorm';
import * as uuid from 'uuid';
import { BillingService } from 'src/domain/billing';
import {
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  ServiceEntity,
  ServiceRepository,
  ServiceVersionEntity,
  ServiceVersionRepository,
} from 'src/domain/database';
import { validateParameters } from 'src/domain/definitions';
import { DeploymentCreatedEvent, SubscriptionCreatedEvent } from 'src/domain/events';
import { User } from 'src/domain/users';
import { WorkerResolver } from 'src/domain/workers';
import { WorkflowService } from 'src/domain/workflows';
import { saveAndFind, UrlService } from 'src/lib';
import { Deployment } from '../interfaces';
import { buildDeployment } from './utils';

export class CreateDeployment extends Command<CreateDeploymentResult> {
  constructor(
    public readonly teamId: number,
    public readonly name: string | undefined | null,
    public readonly serviceId: number,
    public readonly parameters: Record<string, string>,
    public readonly confirmUrl: string | undefined | null,
    public readonly cancelUrl: string | undefined | null,
    public readonly user: User,
  ) {
    super();
  }
}

export class CreateDeploymentResult {
  constructor(public readonly deploymentOrRedirectUrl: Deployment | string) {}
}

@CommandHandler(CreateDeployment)
export class CreateDeploymentHandler implements ICommandHandler<CreateDeployment, CreateDeploymentResult> {
  constructor(
    private readonly billingService: BillingService,
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
    private readonly workerResolver: WorkerResolver,
    private readonly workflows: WorkflowService,
    private readonly urlService: UrlService,
    private readonly events: EventEmitter2,
  ) {}

  async execute(command: CreateDeployment): Promise<CreateDeploymentResult> {
    const { confirmUrl, cancelUrl, name, parameters, serviceId, teamId, user } = command;

    const service = await this.services.findOneBy({ id: serviceId, isPublic: true });
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found.`);
    }

    const version = await this.serviceVersions.findOne({
      where: { serviceId: service.id, isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['service'],
    });
    if (!version) {
      throw new NotFoundException(`Service ${serviceId} has no active version.`);
    }

    // Dynamic validation with the definition.
    validateParameters(version.definition, parameters);

    const workers = await this.workerResolver.getWorkers();
    if (workers.size === 0) {
      throw new NotFoundException('No worker available.');
    }

    const confirmToken = uuid.v4();
    const deployment = await saveAndFind(this.deployments, {
      name,
      confirmToken,
      createdAt: undefined,
      createdBy: user?.id || 'UNKNOWN',
      serviceId,
      status: 'Pending',
      teamId: teamId,
      updatedAt: undefined,
      updatedBy: user?.id || 'UNKNOWN',
    });

    const subscriptionResult = await this.billingService.createSubscription(
      teamId,
      deployment.id,
      this.urlService.confirmUrl(deployment.id, confirmToken, confirmUrl),
      this.urlService.cancelUrl(deployment.id, confirmToken, cancelUrl),
    );

    const environment = {
      ...service.environment,
      // The environment settings from the version overwrite the service.
      ...version.environment,
      deploymentId: deployment.id.toString(),
      deploymentUuid: uuid.v4(),
    };

    const update = await saveAndFind(
      this.deploymentUpdates,
      {
        createdAt: undefined,
        createdBy: user?.id || 'UNKNOWN',
        context: {},
        deployment,
        deploymentId: deployment.id,
        environment,
        parameters,
        serviceVersion: version,
        serviceVersionId: version.id,
      },
      { relations: ['serviceVersion', 'serviceVersion.service'] },
    );

    this.events.emit(DeploymentCreatedEvent.TYPE, new DeploymentCreatedEvent(teamId, deployment.id, name, user?.id));

    if (subscriptionResult !== true) {
      return new CreateDeploymentResult(subscriptionResult.redirectTo);
    }

    // The subscription is active immediately, so there is no separate confirmation step that could log it.
    this.events.emit(SubscriptionCreatedEvent.TYPE, new SubscriptionCreatedEvent(teamId, deployment.id, name, user?.id));

    deployment.status = 'Created';
    await this.deployments.save(deployment);
    await this.workflows.createDeployment(deployment.id, update, null);

    const versions = await this.serviceVersions.find({
      where: { serviceId, name: MoreThan(version.name), isActive: true },
      order: { name: 'ASC' },
    });

    return new CreateDeploymentResult(buildDeployment(deployment, versions, update));
  }
}
