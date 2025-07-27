import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository, DeploymentUpdateEntity, DeploymentUpdateRepository } from 'src/domain/database';
import { Deployment } from '../interfaces';
import { buildDeployment } from './utils';

export class GetDeployments {
  constructor(public readonly teamId: number) {}
}

export class GetDeploymentsResponse {
  constructor(public readonly deployments: Deployment[]) {}
}

@QueryHandler(GetDeployments)
export class GetDeploymentsHandler implements IQueryHandler<GetDeployments, GetDeploymentsResponse> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute(query: GetDeployments): Promise<GetDeploymentsResponse> {
    const { teamId } = query;

    const entities = await this.deployments.find({ where: { teamId } });
    const result: Deployment[] = [];

    for (const entity of entities) {
      const lastUpdate = await this.deploymentUpdates.findOne({
        where: { deploymentId: entity.id },
        order: { id: 'DESC' },
        relations: ['serviceVersion', 'serviceVersion.service'],
      });

      if (!lastUpdate) {
        continue;
      }

      result.push(buildDeployment(entity, lastUpdate.serviceVersion.service));
    }

    return new GetDeploymentsResponse(result);
  }
}
