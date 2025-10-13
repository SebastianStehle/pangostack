import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { Activity } from '../registration';

export type DeleteDeploymentParam = { deploymentId: number };

@Activity(deleteDeployment)
export class DeleteDeploymentActivity implements Activity<DeleteDeploymentParam> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  async execute({ deploymentId }: DeleteDeploymentParam) {
    await this.deployments.delete({ id: deploymentId });
  }
}

export async function deleteDeployment(param: DeleteDeploymentParam): Promise<any> {
  return param;
}
