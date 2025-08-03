import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { DeploymentDto } from 'src/controllers/deployments/dtos';
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
import { User } from 'src/domain/users';
import { WorkflowService } from 'src/domain/workflows';
import { buildDeployment } from './utils';

export class CreateDeployment {
  constructor(
    public readonly teamdId: number,
    public readonly name: string | undefined,
    public readonly serviceId: number,
    public readonly parameters: Record<string, string>,
    public readonly user: User,
  ) {}
}

export class CreateDeploymentResponse {
  constructor(public readonly deployment: DeploymentDto) {}
}

@CommandHandler(CreateDeployment)
export class CreateDeploymentHandler implements ICommandHandler<CreateDeployment, CreateDeploymentResponse> {
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
  ) {}

  async execute(command: CreateDeployment): Promise<CreateDeploymentResponse> {
    const { name, parameters, serviceId, teamdId, user } = command;

    if (!(await this.billingService.hasPaymentDetails(teamdId))) {
      throw new BadRequestException('No billing information configured.');
    }

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

    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    // The environment settings from the version overwrite the service.
    const environment = { ...service.environment, ...version.environment };

    const deployment = await this.deployments.save({
      name,
      createdAt: undefined,
      createdBy: user?.id || 'UNKNOWN',
      teamId: teamdId,
      updatedAt: undefined,
      updatedBy: user?.id || 'UNKNOWN',
    });

    const update = await this.deploymentUpdates.save({
      createdAt: undefined,
      createdBy: user?.id || 'UNKNOWN',
      context: {},
      deployment,
      deploymentId: deployment.id,
      environment,
      parameters,
      serviceVersion: version,
      serviceVersionId: version.id,
    });

    await this.workflows.createDeployment(deployment.id, update, null, teamdId, worker);
    await this.workflows.createSubscription(deployment.id, teamdId);
    return new CreateDeploymentResponse(buildDeployment(deployment, update));
  }
}
