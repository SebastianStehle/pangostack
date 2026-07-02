import { ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan } from 'typeorm';
import { DeploymentEntity, DeploymentMetricEntity, DeploymentMetricRepository, DeploymentRepository } from 'src/domain/database';
import { MetricDatapoint, MetricSeries } from '../interfaces';
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
  private readonly logger = new Logger(GetDeploymentMetricsHandler.name);

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

    const updates = [...(deployment.updates || [])].sort((a, b) => b.id - a.id);

    // Fall back to the latest update, so that the metrics are also shown before the deployment has been completed.
    const update = updates.find(({ status }) => status === 'Completed') || updates[0];

    const metricDefinitions = update?.serviceVersion.definition.metrics || [];
    if (metricDefinitions.length === 0) {
      return new GetDeploymentMetricsResult([]);
    }

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    let records: DeploymentMetricEntity[] = [];
    try {
      records = await this.deploymentMetrics.find({
        where: { deploymentId, createdAt: MoreThan(since) },
        order: { createdAt: 'ASC' },
      });
    } catch (ex) {
      // The metrics should always be shown, even if the values cannot be loaded.
      this.logger.error(`Failed to load metric values for deployment ${deploymentId}.`, ex);
    }

    const metrics: MetricSeries[] = metricDefinitions.map(({ key, label, unit, chart, summaries }) => ({
      key,
      label,
      unit,
      chart,
      summaries: summaries || [],
      datapoints: buildDatapoints(records, key),
    }));

    return new GetDeploymentMetricsResult(metrics);
  }
}

function buildDatapoints(records: DeploymentMetricEntity[], key: string): MetricDatapoint[] {
  return records
    .filter(({ metricKey }) => metricKey === key)
    .map(({ createdAt, values }) => ({ timestamp: createdAt.toISOString(), values }));
}
