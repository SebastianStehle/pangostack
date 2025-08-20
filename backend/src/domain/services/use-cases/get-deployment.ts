import { ForbiddenException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentCheckEntity,
  DeploymentCheckRepository,
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
} from 'src/domain/database';
import { Deployment } from '../interfaces';
import { DeploymentPolicy } from '../policies';
import { buildDeployment } from './utils';

export class GetDeploymentQuery extends Query<GetDeploymentResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
  ) {
    super();
  }
}

export class GetDeploymentResult {
  constructor(public readonly deployment?: Deployment | null) {}
}

@QueryHandler(GetDeploymentQuery)
export class GetDeploymentHandler implements IQueryHandler<GetDeploymentQuery, GetDeploymentResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
  ) {}

  async execute(query: GetDeploymentQuery): Promise<GetDeploymentResult> {
    const { deploymentId, policy } = query;

    const entity = await this.deployments.findOne({ where: { id: deploymentId }, order: { id: 'DESC' } });
    if (!entity) {
      return new GetDeploymentResult();
    }

    if (!policy) {
      throw new ForbiddenException();
    }

    const lastUpdate = await this.deploymentUpdates.findOne({
      where: { deploymentId: entity.id },
      order: { id: 'DESC' },
      relations: ['serviceVersion', 'serviceVersion.service'],
    });

    if (!lastUpdate) {
      return new GetDeploymentResult();
    }

    const lastCheck = await this.deploymentChecks.findOne({
      where: { deploymentId: entity.id },
      order: { id: 'DESC' },
    });

    return new GetDeploymentResult(buildDeployment(entity, lastUpdate, lastCheck));
  }
}
