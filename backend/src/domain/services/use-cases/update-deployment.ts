import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
import { validateParameters } from 'src/domain/definitions';
import { User } from 'src/domain/users';
import { WorkflowService } from 'src/domain/workflows';
import { saveAndFind } from 'src/lib';
import { Deployment } from '../interfaces';
import { DeploymentPolicy } from '../policies';
import { buildDeployment } from './utils';

export class UpdateDeployment extends Command<UpdateDeploymentResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
    public readonly name: string | undefined | null,
    public readonly parameters: Record<string, string> | undefined | null,
    public readonly versionId: number | undefined | null,
    public readonly user: User,
  ) {
    super();
  }
}

export class UpdateDeploymentResult {
  constructor(public readonly deployment: Deployment) {}
}

@CommandHandler(UpdateDeployment)
export class UpdateDeploymentHandler implements ICommandHandler<UpdateDeployment, UpdateDeploymentResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
    private readonly workflows: WorkflowService,
  ) {}

  async execute(command: UpdateDeployment): Promise<UpdateDeploymentResult> {
    const { deploymentId, name, policy, user, versionId } = command;

    const deployment = await this.deployments.findOne({ where: { id: deploymentId } });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy.isAllowed(deployment)) {
      throw new ForbiddenException();
    }

    const lastUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId, status: 'Completed' },
      order: { id: 'DESC' },
      relations: ['serviceVersion', 'serviceVersion.service'],
    });
    if (!lastUpdate) {
      throw new NotFoundException(`Deployment ${deploymentId} was never really created`);
    }

    let version = lastUpdate.serviceVersion;
    if (versionId) {
      const candidateVersion = await this.serviceVersions.findOne({
        where: { id: versionId, isActive: true },
        order: { name: 'DESC' },
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

    const parameters = command.parameters || lastUpdate.parameters;

    // Event validate with the current parameters to ensure that they still match to the current version.
    validateParameters(version.definition, parameters, lastUpdate.parameters);

    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    if (name) {
      deployment.name = name;
      await this.deployments.save(deployment);
    }

    // The environment settings from the version overwrite the service.
    const environment = { ...version.service.environment, ...version.environment };

    const update = await saveAndFind(
      this.deploymentUpdates,
      {
        context: lastUpdate.context,
        createdAt: undefined,
        createdBy: user?.id || 'UNKNOWN',
        deployment,
        deploymentId: deployment.id,
        environment,
        parameters,
        resourceConnections: lastUpdate.resourceConnections,
        resourceContexts: lastUpdate.resourceContexts,
        serviceVersion: version,
        serviceVersionId: version.id,
      },
      { relations: ['serviceVersion', 'serviceVersion.service'] },
    );

    await this.workflows.createDeployment(deployment.id, update, lastUpdate);

    return new UpdateDeploymentResult(buildDeployment(deployment, update));
  }
}
