import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan } from 'typeorm';
import { DeploymentEntity, DeploymentRepository, DeploymentUsageEntity, DeploymentUsageRepository } from 'src/domain/database';
import { getDatesInRange } from 'src/lib';
import { UsageSummary } from '../interfaces';

export class GetDeploymentUsages {
  constructor(
    public readonly teamId: number,
    public readonly deploymentId: number,
    public readonly dateFrom: string,
    public readonly dateTo: string,
  ) {}
}

export class GetDeploymentUsagesResponse {
  constructor(public readonly usages: UsageSummary[]) {}
}

@QueryHandler(GetDeploymentUsages)
export class GetDeploymentUsagesHandler implements IQueryHandler<GetDeploymentUsages, GetDeploymentUsagesResponse> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUsageEntity)
    private readonly deploymentUsages: DeploymentUsageRepository,
  ) {}

  async execute(query: GetDeploymentUsages): Promise<GetDeploymentUsagesResponse> {
    const { dateFrom, dateTo, deploymentId, teamId } = query;

    // Also validates the dates, therefore call this method first.
    const dates = getDatesInRange(dateFrom, dateTo, 90);

    const deployment = await this.deployments.findOne({
      where: { id: deploymentId, teamId },
      relations: ['updates', 'updates.serviceVersion'],
    });

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
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

    return new GetDeploymentUsagesResponse(usages);
  }
}
