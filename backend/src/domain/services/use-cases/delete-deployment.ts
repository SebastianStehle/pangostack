import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository, DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { DeploymentDeletedEvent } from 'src/domain/events';
import { User } from 'src/domain/users';
import { WorkerResolver } from 'src/domain/workers';
import { WorkflowService } from 'src/domain/workflows';
import { DeploymentPolicy } from '../policies';

export class DeleteDeployment {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
    public readonly user?: User,
  ) {}
}

@CommandHandler(DeleteDeployment)
export class DeleteDeploymentHandler implements ICommandHandler<DeleteDeployment, any> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    private readonly workerResolver: WorkerResolver,
    private readonly workflows: WorkflowService,
    private readonly events: EventEmitter2,
  ) {}

  async execute(command: DeleteDeployment): Promise<any> {
    const { deploymentId, policy, user } = command;

    const deployment = await this.deployments.findOne({ where: { id: deploymentId }, order: { id: 'DESC' } });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy.isAllowed(deployment)) {
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
      const workers = await this.workerResolver.getWorkers();
      if (workers.size === 0) {
        throw new NotFoundException('No worker available.');
      }

      await this.workflows.deleteDeployment(deployment.id, lastUpdate);
    }

    const event = new DeploymentDeletedEvent(deployment.teamId, deployment.id, deployment.name, user?.id);
    this.events.emit(DeploymentDeletedEvent.TYPE, event);

    return { deployment };
  }
}
