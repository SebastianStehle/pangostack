import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import {
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  WorkerEntity,
  WorkerRepository,
} from 'src/domain/database';
import { WorkflowService } from 'src/domain/workflows';
import { DeploymentPolicy } from '../policies';

export class DeleteDeployment {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
  ) {}
}

@CommandHandler(DeleteDeployment)
export class DeleteDeploymentHandler implements ICommandHandler<DeleteDeployment, any> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(WorkerEntity)
    private readonly workerRepository: WorkerRepository,
    private readonly workflows: WorkflowService,
  ) {}

  async execute(command: DeleteDeployment): Promise<any> {
    const { deploymentId, policy } = command;

    const deployment = await this.deployments.findOne({ where: { id: deploymentId }, order: { id: 'DESC' } });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy) {
      throw new ForbiddenException();
    }

    const lastUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId: deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });
    if (!lastUpdate) {
      throw new NotFoundException(`Deployment ${deploymentId} was never really created`);
    }

    if (deployment.status === 'Created') {
      const worker = await this.workerRepository.findOne({ where: { endpoint: Not(IsNull()) } });
      if (!worker) {
        throw new NotFoundException('No worker registered.');
      }

      await this.workflows.deleteDeployment(deployment.id, lastUpdate);
    }

    return { deployment };
  }
}
