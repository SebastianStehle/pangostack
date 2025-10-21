import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { last } from 'src/lib';
import { Activity } from '../registration';

export type GetDeploymentParam = { id: number };
export type GetDeploymentResult = {
  id: number;
  name?: string;
  serviceName: string;
  serviceVersion: string;
  teamId: number;
} | null;

@Activity(getDeployment)
export class GetDeploymentActivity implements Activity<GetDeploymentParam, GetDeploymentResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  async execute(param: GetDeploymentParam) {
    const { id } = param;
    const deployment = await this.deployments.findOne({
      where: { id, status: 'Created' },
      relations: ['service', 'updates', 'updates.serviceVersion'],
    });

    if (!deployment) {
      return null;
    }

    return {
      id: deployment.id,
      name: deployment.name || deployment.service.name,
      serviceName: deployment.service.name,
      serviceVersion: last(deployment.updates).serviceVersion.name,
      teamId: deployment.teamId,
    };
  }
}

export async function getDeployment(param: GetDeploymentParam): Promise<GetDeploymentResult> {
  return param as any;
}
