import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { last, UrlService } from 'src/lib';
import { Activity } from '../registration';

export type GetDeploymentsParam = object;
export type GetDeploymentsResult = {
  id: number;
  name?: string;
  serviceName: string;
  serviceVersion: string;
  teamId: number;
  url: string;
}[];

@Activity(getDeployments)
export class GetDeploymentsActivity implements Activity<GetDeploymentsParam, GetDeploymentsResult> {
  constructor(
    private readonly urlService: UrlService,
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  async execute() {
    const deployments = await this.deployments.find({
      where: { status: 'Created' },
      relations: ['service', 'updates', 'updates.serviceVersion'],
    });

    return deployments.map((deployment) => ({
      id: deployment.id,
      name: deployment.name || deployment.service.name,
      serviceName: deployment.service.name,
      serviceVersion: last(deployment.updates).serviceVersion.name,
      teamId: deployment.teamId,
      url: this.urlService.deploymentUrl(deployment.teamId, deployment.id),
    }));
  }
}

export async function getDeployments(param: GetDeploymentsParam): Promise<GetDeploymentsResult> {
  return param as any;
}
