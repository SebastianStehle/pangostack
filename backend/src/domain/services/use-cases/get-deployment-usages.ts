import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, DeploymentUsageEntity, DeploymentUsageRepository } from 'src/domain/database';
import { getDatesInRange } from 'src/lib';
import { UsageSummary } from '../interfaces';
import { DeploymentPolicy } from '../policies';

export class GetDeploymentUsagesQuery extends Query<GetDeploymentUsagesResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
    public readonly dateFrom: string,
    public readonly dateTo: string,
  ) {
    super();
  }
}

export class GetDeploymentUsagesResult {
  constructor(public readonly usages: UsageSummary[]) {}
}

@QueryHandler(GetDeploymentUsagesQuery)
export class GetDeploymentUsagesHandler implements IQueryHandler<GetDeploymentUsagesQuery, GetDeploymentUsagesResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUsageEntity)
    private readonly deploymentUsages: DeploymentUsageRepository,
  ) {}

  async execute(query: GetDeploymentUsagesQuery): Promise<GetDeploymentUsagesResult> {
    const { dateFrom, dateTo, deploymentId, policy } = query;

    // Also validates the dates, therefore call this method first.
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

    const rawUsages = await this.deploymentUsages
      .createQueryBuilder('usage')
      .select('usage.trackDate', 'date')
      .addSelect('SUM(usage.totalCores)', 'totalCores')
      .addSelect('SUM(usage.totalMemoryGB)', 'totalMemoryGB')
      .addSelect('SUM(usage.totalVolumeGB)', 'totalVolumeGB')
      .addSelect('MAX(usage.totalStorageGB)', 'totalStorageGB')
      .where('usage.trackDate BETWEEN :dateFrom AND :dateTo AND usage.deploymentId = :deploymentId', {
        dateFrom,
        dateTo,
        deploymentId,
      })
      .groupBy('usage.deploymentId')
      .groupBy('usage.trackDate')
      .getRawMany<UsageSummary>();

    let previousStorageGB = -1;

    const usages: UsageSummary[] = [];
    for (const date of dates) {
      let usage = rawUsages.find((x) => x.date === date);
      if (!usage) {
        // The storage is up to this date. Therefore we use the previous day, if we have no data for the given date.
        if (previousStorageGB < 0) {
          const latestUsage = await this.deploymentUsages.findOne({
            where: { trackDate: LessThan(dateFrom), deploymentId },
            order: { trackDate: 'DESC', trackHour: 'DESC' },
          });

          previousStorageGB = latestUsage?.totalStorageGB ?? 0;
        }

        usage = {
          date,
          totalCores: 0,
          totalMemoryGB: 0,
          totalVolumeGB: 0,
          totalStorageGB: previousStorageGB,
        };
      }

      usages.push(usage);
      previousStorageGB = usage.totalStorageGB;
    }

    return new GetDeploymentUsagesResult(usages);
  }
}
