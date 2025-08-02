import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
  DeploymentUpdateStatus,
} from 'src/domain/database/entities/deployment-update';

export interface UpdateDeploymentParam {
  updateId: number;
  status: DeploymentUpdateStatus;
  error?: string;
}

@Injectable()
export class UpdateDeploymentActivity {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdateRepository: DeploymentUpdateRepository,
  ) {}

  async execute({ updateId, status, error }: UpdateDeploymentParam): Promise<any> {
    const update = await this.deploymentUpdateRepository.findOneBy({ id: updateId });
    if (!update) {
      throw new NotFoundException(`Deployment Update ${updateId} not found.`);
    }

    update.status = status;
    update.error = error;
    await this.deploymentUpdateRepository.save(update);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateDeployment(_: UpdateDeploymentParam): Promise<any> {
  return true;
}
