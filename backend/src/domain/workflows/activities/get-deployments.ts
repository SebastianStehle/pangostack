import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { last } from 'src/lib';
import { Activity } from '../registration';

export type GetDeploymentsParam = object;
export type GetDeploymentsResult = { id: number; name?: string; serviceName: string; serviceVersion: string; teamId: number }[];

@Activity(getDeployments)
export class GetDeploymentsActivity implements Activity<GetDeploymentsParam, GetDeploymentsResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  async execute() {
    const deployments = await this.deployments.find({
      where: { status: 'Created' },
      relations: ['service', 'updates', 'updates.serviceVersion'],
    });

    return deployments.map((x) => ({
      id: x.id,
      name: x.name || x.service.name,
      serviceName: x.service.name,
      serviceVersion: last(x.updates).serviceVersion.name,
      teamId: x.teamId,
    }));
  }
}

export async function getDeployments(param: GetDeploymentsParam): Promise<GetDeploymentsResult> {
  return param as any;
}
