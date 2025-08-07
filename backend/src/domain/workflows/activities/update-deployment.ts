import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentUpdateEntity, DeploymentUpdateRepository, DeploymentUpdateStatus } from 'src/domain/database';
import { Activity } from '../registration';

export type UpdateDeploymentParam = { updateId: number; status: DeploymentUpdateStatus; error?: string };

@Activity(updateDeployment)
export class UpdateDeploymentActivity implements Activity<UpdateDeploymentParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute({ updateId, status, error }: UpdateDeploymentParam) {
    const update = await this.deploymentUpdates.findOneBy({ id: updateId });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    update.status = status;
    update.error = error;
    await this.deploymentUpdates.save(update);
  }
}

export async function updateDeployment(param: UpdateDeploymentParam): Promise<any> {
  return param;
}
