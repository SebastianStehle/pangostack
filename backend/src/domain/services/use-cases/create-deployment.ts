import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
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
  WorkerEntity,
  WorkerRepository,
} from 'src/domain/database';
import { validateParameters } from 'src/domain/definitions';
import { User } from 'src/domain/users';
import { WorkflowService } from 'src/domain/workflows';
import { saveAndFind } from 'src/lib';
import { Deployment } from '../interfaces';
import { UrlService } from '../services/url.service';
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
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
    private readonly workflows: WorkflowService,
    private readonly urlService: UrlService,
  ) {}

  async execute(command: CreateDeployment): Promise<CreateDeploymentResult> {
    const { confirmUrl, cancelUrl, name, parameters, serviceId, teamId, user } = command;

    const service = await this.services.findOneBy({ id: serviceId });
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

    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
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

    // The environment settings from the version overwrite the service.
    const environment = { ...service.environment, ...version.environment };

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

    if (subscriptionResult !== true) {
      return new CreateDeploymentResult(subscriptionResult.redirectTo);
    }

    deployment.status = 'Created';
    await this.deployments.save(deployment);
    await this.workflows.createDeployment(deployment.id, update, null);

    return new CreateDeploymentResult(buildDeployment(deployment, update));
  }
}
