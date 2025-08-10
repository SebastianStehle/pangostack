import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import {
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  ServiceVersionEntity,
  ServiceVersionRepository,
  WorkerEntity,
  WorkerRepository,
} from 'src/domain/database';
import { User } from 'src/domain/users';
import { WorkflowService } from 'src/domain/workflows';
import { saveAndFind } from 'src/lib';
import { Deployment } from '../interfaces';
import { buildDeployment } from './utils';

export class UpdateDeployment {
  constructor(
    public readonly teamId: number,
    public readonly deploymentId: number,
    public readonly name: string | undefined | null,
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
    private readonly workflows: WorkflowService,
  ) {}

  async execute(command: UpdateDeployment): Promise<UpdateDeploymentResponse> {
    const { deploymentId, name, parameters, teamId, user, versionId } = command;

    const deployment = await this.deployments.findOne({ where: { id: deploymentId, teamId } });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    const lastUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });
    if (!lastUpdate) {
      throw new NotFoundException(`Deployment ${deploymentId} was never really created`);
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

    if (name) {
      deployment.name = name;
      await this.deployments.save(deployment);
    }

    // The environment settings from the version overwrite the service.
    const environment = { ...version.service.environment, ...version.environment };

    const update = await saveAndFind(this.deploymentUpdates, {
      context: {},
      createdAt: undefined,
      createdBy: user?.id || 'UNKNOWN',
      deployment,
      deploymentId: deployment.id,
      environment,
      parameters: parameters || lastUpdate.parameters,
      serviceVersion: version,
      serviceVersionId: version.id,
    });

    await this.workflows.createDeployment(deployment.id, update, lastUpdate, worker);

    return new UpdateDeploymentResponse(buildDeployment(deployment, update));
  }
}
