import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan } from 'typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository, DeploymentUpdateStatus } from 'src/domain/database';
import { DeploymentReadyEvent, DeploymentUpdatedEvent } from 'src/domain/events';
import { Activity } from '../registration';

export type UpdateDeploymentParam = { updateId: number; status: DeploymentUpdateStatus; error?: string };

@Activity(updateDeployment)
export class UpdateDeploymentActivity implements Activity<UpdateDeploymentParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute({ updateId, status, error }: UpdateDeploymentParam) {
    const update = await this.deploymentUpdates.findOne({ where: { id: updateId }, relations: ['deployment'] });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    // A retry of this activity must not announce the same update twice.
    const isNewlyCompleted = status === 'Completed' && update.status !== 'Completed';

    update.status = status;
    update.error = error;
    await this.deploymentUpdates.save(update);

    if (!isNewlyCompleted) {
      return;
    }

    const { deployment, deploymentId } = update;
    const hasCompletedBefore = await this.deploymentUpdates.existsBy({
      deploymentId,
      id: LessThan(updateId),
      status: 'Completed',
    });

    if (hasCompletedBefore) {
      this.events.emit(DeploymentUpdatedEvent.TYPE, new DeploymentUpdatedEvent(deployment.teamId, deploymentId, deployment.name));
    } else {
      this.events.emit(DeploymentReadyEvent.TYPE, new DeploymentReadyEvent(deployment.teamId, deploymentId, deployment.name));
    }
  }
}

export async function updateDeployment(param: UpdateDeploymentParam): Promise<any> {
  return param;
}
