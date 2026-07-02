import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan } from 'typeorm';
import { DeploymentEntity, DeploymentMetricEntity, DeploymentMetricRepository, DeploymentRepository } from 'src/domain/database';
import { MetricSeries } from '../interfaces';
import { DeploymentPolicy } from '../policies';

const MAX_HOURS = 31 * 24;

export class GetDeploymentMetricsQuery extends Query<GetDeploymentMetricsResult> {
  constructor(
    public readonly deploymentId: number,
    public readonly policy: DeploymentPolicy,
    public readonly hours: number,
  ) {
    super();
  }
}

export class GetDeploymentMetricsResult {
  constructor(public readonly metrics: MetricSeries[]) {}
}

@QueryHandler(GetDeploymentMetricsQuery)
export class GetDeploymentMetricsHandler implements IQueryHandler<GetDeploymentMetricsQuery, GetDeploymentMetricsResult> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentMetricEntity)
    private readonly deploymentMetrics: DeploymentMetricRepository,
  ) {}

  async execute(query: GetDeploymentMetricsQuery): Promise<GetDeploymentMetricsResult> {
    const { deploymentId, policy } = query;

    const hours = Math.min(Math.max(query.hours, 1), MAX_HOURS);

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

    const update = [...(deployment.updates || [])].sort((a, b) => b.id - a.id).find((x) => x.status === 'Completed');

    const metricDefinitions = update?.serviceVersion.definition.metrics || [];
    if (metricDefinitions.length === 0) {
      return new GetDeploymentMetricsResult([]);
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const records = await this.deploymentMetrics.find({
      where: { deploymentId, createdAt: MoreThan(since) },
      order: { createdAt: 'ASC' },
    });

    const metrics: MetricSeries[] = metricDefinitions.map(({ key, label, unit, chart, summaries }) => ({
      key,
      label,
      unit,
      chart,
      summaries: summaries || [],
      datapoints: records
        .filter((x) => x.metricKey === key)
        .map((x) => ({ timestamp: x.createdAt.toISOString(), values: x.values })),
    }));

    return new GetDeploymentMetricsResult(metrics);
  }
}
