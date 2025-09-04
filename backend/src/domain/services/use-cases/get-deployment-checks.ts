import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays } from 'date-fns';
import { Between } from 'typeorm';
import { DeploymentCheckEntity, DeploymentCheckRepository, DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import { formatDate, getDatesInRange } from 'src/lib';
import { CheckSummary } from '../interfaces';
import { DeploymentPolicy } from '../policies';

export class GetDeploymentChecksQuery extends Query<GetDeploymentChecksResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
    public readonly dateFrom: string,
    public readonly dateTo: string,
  ) {
    super();
  }
}

export class GetDeploymentChecksResult {
  constructor(public readonly checks: CheckSummary[]) {}
}

@QueryHandler(GetDeploymentChecksQuery)
export class GetDeploymentChecksHandler implements IQueryHandler<GetDeploymentChecksQuery, GetDeploymentChecksResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
  ) {}

  async execute(query: GetDeploymentChecksQuery): Promise<GetDeploymentChecksResult> {
    const { dateFrom, dateTo, deploymentId, policy } = query;

    // Also valdiates the dates, therefore call this method first.
    const dates = getDatesInRange(dateFrom, dateTo, 90);

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['updates', 'updates.serviceVersion'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    if (!policy.isAllowed(deployment)) {
      throw new ForbiddenException();
    }

    const dateFromRaw = new Date(dateFrom);
    const dateToRaw = addDays(new Date(dateTo), 1);

    const rawChecks = await this.deploymentChecks.find({
      where: {
        createdAt: Between(dateFromRaw, dateToRaw),
        deploymentId,
      },
    });

    const countsMap = new Map<string, { numFailures: number; numSuccesses: number }>();

    for (const date of dates) {
      countsMap.set(date, { numFailures: 0, numSuccesses: 0 });
    }

    for (const check of rawChecks) {
      const day = formatDate(check.createdAt);
      const entry = countsMap.get(day);
      if (!entry) {
        continue;
      }

      if (check.status === 'Failed') {
        entry.numFailures++;
      } else {
        entry.numSuccesses++;
      }
    }

    const checks = dates.map((date) => ({
      date,
      totalFailures: countsMap.get(date)?.numFailures ?? 0,
      totalSuccesses: countsMap.get(date)?.numSuccesses ?? 0,
    }));

    return new GetDeploymentChecksResult(checks);
  }
}
