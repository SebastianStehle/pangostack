import { NotFoundException } from '@nestjs/common';
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

export class DeleteDeployment {
  constructor(public readonly id: number) {}
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
    const { id } = command;

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

    const worker = await this.workerRepository.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    await this.workflows.deleteDeployment(deployment, lastUpdate, worker);
    return { deployment };
  }
}
