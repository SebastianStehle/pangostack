import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere } from 'typeorm';
import {
  DeploymentCheckEntity,
  DeploymentCheckRepository,
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
} from 'src/domain/database';
import { Deployment } from '../interfaces';
import { buildDeployment } from './utils';

export class GetDeploymentsQuery extends Query<GetDeploymentsResult> {
  constructor(
    public readonly page = 0,
    public readonly pageSize = 10,
    public readonly teamId = 0,
    public readonly serviceId = 0,
  ) {
    super();
  }
}

export class GetDeploymentsResult {
  constructor(
    public readonly deployments: Deployment[],
    public readonly total: number,
  ) {}
}

@QueryHandler(GetDeploymentsQuery)
export class GetDeploymentsHandler implements IQueryHandler<GetDeploymentsQuery, GetDeploymentsResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute(query: GetDeploymentsQuery): Promise<GetDeploymentsResult> {
    const { page, pageSize, serviceId, teamId } = query;

    const where: FindOptionsWhere<DeploymentEntity> = {};

    if (teamId > 0) {
      where.teamId = teamId;
    }

    if (serviceId > 0) {
      where.serviceId = serviceId;
    }

    const options: FindManyOptions<DeploymentEntity> = { order: { id: 'DESC' }, where };
    const total = await this.deployments.count(options);

    options.skip = pageSize * page;
    options.take = pageSize;

    const entities = await this.deployments.find(options);
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

      const lastCheck = await this.deploymentChecks.findOne({
        where: { deploymentId: entity.id },
        order: { id: 'DESC' },
      });

      result.push(buildDeployment(entity, lastUpdate, lastCheck));
    }

    return new GetDeploymentsResult(result, total);
  }
}
