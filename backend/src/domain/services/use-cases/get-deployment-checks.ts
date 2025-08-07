import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentCheckEntity, DeploymentCheckRepository, DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { getDatesInRange } from 'src/lib';
import { CheckSummary } from '../interfaces';

export class GetDeploymentChecks {
  constructor(
    public readonly deploymentId: number,
    public readonly dateFrom: string,
    public readonly dateTo: string,
  ) {}
}

export class GetDeploymentChecksResponse {
  constructor(public readonly checks: CheckSummary[]) {}
}

@QueryHandler(GetDeploymentChecks)
export class GetDeploymentChecksHandler implements IQueryHandler<GetDeploymentChecks, GetDeploymentChecksResponse> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
  ) {}

  async execute(query: GetDeploymentChecks): Promise<GetDeploymentChecksResponse> {
    const { dateFrom, dateTo, deploymentId } = query;

    // Also valdiates the dates, therefore call this method first.
    const dates = getDatesInRange(dateFrom, dateTo, 90);

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['updates', 'updates.serviceVersion'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    const rawChecks = await this.deploymentChecks
      .createQueryBuilder('check')
      .select('CAST(check.createdAt AS DATE)', 'date')
      .addSelect("SUM(CASE WHEN check.status = 'Failed' THEN 1 ELSE 0 END)", 'numFailures')
      .addSelect("SUM(CASE WHEN check.status = 'Success' THEN 1 ELSE 0 END)", 'numSuccesses')
      .groupBy('CAST(check.createdAt AS DATE)')
      .orderBy('date', 'ASC')
      .getRawMany<CheckSummary>();

    const checks: CheckSummary[] = dates.map(
      (date) =>
        rawChecks.find((x) => x.date === date) || {
          date,
          totalFailures: 0,
          totalSuccesses: 0,
        },
    );

    return new GetDeploymentChecksResponse(checks);
  }
}
