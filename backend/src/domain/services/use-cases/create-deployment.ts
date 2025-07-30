import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import {
  DeploymentEntity,
  DeploymentRepository,
  ServiceEntity,
  ServiceRepository,
  ServiceVersionEntity,
  ServiceVersionRepository,
  WorkerEntity,
  WorkerRepository,
} from 'src/domain/database';
import { DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database/entities/deployment-update';
import { User } from 'src/domain/users';
import { Deployment } from '../interfaces';
import { WorkflowRunner } from '../workflows/runner';
import { buildDeployment } from './utils';

export class CreateDeployment {
  constructor(
    public readonly teamdId: number,
    public readonly serviceId: number,
    public readonly parameters: Record<string, string>,
    public readonly user: User,
  ) {}
}

export class CreateDeploymentResponse {
  constructor(public readonly deployment: Deployment) {}
}

@CommandHandler(CreateDeployment)
export class CreateDeploymentHandler implements ICommandHandler<CreateDeployment, CreateDeploymentResponse> {
  constructor(
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
    private readonly runner: WorkflowRunner,
  ) {}

  async execute(command: CreateDeployment): Promise<CreateDeploymentResponse> {
    const { parameters, serviceId, teamdId, user } = command;

    const service = await this.services.findOneBy({ id: serviceId });
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found.`);
    }

    const version = await this.serviceVersions.findOne({
      where: { serviceId: service.id, isActive: true },
      order: { createdAt: 'DESC' },
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

    const deployment = this.deployments.create();
    deployment.createdAt = undefined;
    deployment.createdBy = user?.id || 'UNKNOWN';
    deployment.teamId = teamdId;
    deployment.updatedAt = undefined;
    deployment.updatedBy = user?.id || 'UNKNOWN';
    await this.deployments.save(deployment);

    const update = this.deploymentUpdates.create();
    update.createdAt = undefined;
    update.createdBy = user?.id || 'UNKNOWN';
    update.context = {};
    update.deployment = deployment;
    update.deploymentId = deployment.id;
    update.environment = environment;
    update.parameters = parameters;
    update.serviceVersion = version;
    update.serviceVersionId = version.id;
    await this.deploymentUpdates.save(update);

    await this.runner.deploy(deployment, update, version, worker);
    return { deployment: buildDeployment(deployment, service) };
  }
}
