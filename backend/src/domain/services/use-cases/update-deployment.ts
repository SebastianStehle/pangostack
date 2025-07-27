import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import {
  DeploymentEntity,
  DeploymentRepository,
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

export class UpdateDeployment {
  constructor(
    public readonly id: number,
    public readonly parameters: Record<string, string> | null,
    public readonly versionId: number | null,
    public readonly user: User,
  ) {}
}

export class UpdateDeploymentResponse {
  constructor(public readonly deployment: Deployment) {}
}

@CommandHandler(UpdateDeployment)
export class UpdateDeploymentHandler implements ICommandHandler<UpdateDeployment, UpdateDeploymentResponse> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: WorkerRepository,
    private readonly runner: WorkflowRunner,
  ) {}

  async execute(command: UpdateDeployment): Promise<UpdateDeploymentResponse> {
    const { id, parameters, user, versionId } = command;

    const deployment = await this.deployments.findOne({ where: { id }, relations: ['version', 'version.service'] });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${id} not found`);
    }

    const lastUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId: id },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });
    if (!lastUpdate) {
      throw new NotFoundException(`Deployment ${id} was never really created`);
    }

    let version = lastUpdate.serviceVersion;
    if (versionId) {
      const candidateVersion = await this.serviceVersions.findOne({
        where: { id: versionId, isActive: true },
        relations: ['service'],
      });

      if (!candidateVersion) {
        throw new NotFoundException(`Service version ${versionId} not found`);
      }

      if (candidateVersion.name.localeCompare(version.name) < 0) {
        throw new BadRequestException(`Service version ${versionId} is lower than current version`);
      }

      if (candidateVersion.serviceId !== version.serviceId) {
        throw new BadRequestException('Cannot change service.');
      }

      version = candidateVersion;
    }

    const worker = await this.workerRepository.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    const update = new DeploymentUpdateEntity();
    update.createdAt = undefined;
    update.createdBy = user?.id || 'UNKNOWN';
    update.context = {};
    update.deploymentId = deployment.id;
    update.environment = version.service.environment;
    update.parameters = parameters || lastUpdate.parameters;
    update.serviceVersionId = version.id;
    await this.deploymentUpdates.save(update);

    await this.runner.deploy(deployment, update, version, worker);
    return { deployment: buildDeployment(deployment, version.service) };
  }
}
