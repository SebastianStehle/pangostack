import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { Activity } from '../registration';

export type GetDeploymentsParam = object;

@Activity(getDeployments)
export class GetDeploymentsActivity implements Activity<GetDeploymentsParam, number[]> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  async execute() {
    const deployments = await this.deployments.find({ where: { status: 'Created' } });

    return deployments.map((x) => x.id);
  }
}

export async function getDeployments(param: GetDeploymentsParam): Promise<number[]> {
  return param as any;
}
