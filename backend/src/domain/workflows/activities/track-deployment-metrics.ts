import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentMetricEntity,
  DeploymentMetricRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
} from 'src/domain/database';
import { evaluateParameters, MetricDefinition } from 'src/domain/definitions';
import { getEvaluationContext, getResourceUniqueId } from 'src/domain/services';
import { MetricsResultDto, WorkerResolver } from 'src/domain/workers';
import { parseDurationMs } from 'src/lib';
import { Activity } from '../registration';

const METRICS_REQUEST_TIMEOUT_MS = 60 * 1000;

// The base schedule does not align perfectly with the metric intervals, therefore allow a small tolerance.
const INTERVAL_TOLERANCE_MS = 30 * 1000;

export type TrackDeploymentMetricsParam = {
  deploymentId: number;
};

@Activity(trackDeploymentMetrics)
export class TrackDeploymentMetricsActivity implements Activity<TrackDeploymentMetricsParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentMetricEntity)
    private readonly deploymentMetrics: DeploymentMetricRepository,
    private readonly workerResolver: WorkerResolver,
  ) {}

  async execute({ deploymentId }: TrackDeploymentMetricsParam) {
    const updates = await this.deploymentUpdates.find({
      where: { deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });

    if (updates.length === 0) {
      // Throw an error to make the tracking easier.
      throw new NotFoundException(`Update for deployment ${deploymentId} not found`);
    }

    const update = updates.find(({ status }) => status === 'Completed');
    if (!update) {
      // Deployment has not been completed yet. This is normal behavior.
      return;
    }

    const { context, definition } = getEvaluationContext(update);

    const metricDefinitions = definition.metrics || [];
    if (metricDefinitions.length === 0) {
      return;
    }

    const dueMetrics = await this.getDueMetrics(deploymentId, metricDefinitions);
    if (dueMetrics.length === 0) {
      return;
    }

    // Only query the resource types that are actually needed for the due metrics.
    const resourceTypes = new Set(dueMetrics.flatMap(({ mapping }) => mapping.map(({ resource }) => resource)));
    const resources = definition.resources.filter(({ type }) => resourceTypes.has(type));
    if (resources.length === 0) {
      return;
    }

    const workers = await this.workerResolver.getWorkers();

    const responses: MetricsResultDto[] = [];
    for (const resource of resources) {
      const worker = workers.get(resource.type);
      if (!worker) {
        // Do not log missing workers. It would flood the log with entries.
        continue;
      }

      responses.push(
        await worker.client.status.postMetrics({
          resources: [
            {
              parameters: evaluateParameters(resource, context),
              resourceContext: update.resourceContexts[resource.id] || {},
              resourceUniqueId: getResourceUniqueId(deploymentId, resource),
              resourceType: resource.type,
              timeoutMs: METRICS_REQUEST_TIMEOUT_MS,
            },
          ],
        }),
      );
    }

    const metricResources = responses.flatMap(({ resources: fromWorker }) => fromWorker);

    for (const metric of dueMetrics) {
      const values: Record<string, number> = {};

      for (const mapping of metric.mapping) {
        for (const resource of metricResources) {
          if (resource.resourceType !== mapping.resource) {
            continue;
          }

          const resourceValues = resource.metrics[mapping.from] as Record<string, number> | undefined;
          if (!resourceValues) {
            continue;
          }

          // The prefix separates the values of different mappings, multiple resources of the same type are summed up.
          for (const [key, value] of Object.entries(resourceValues)) {
            const prefixedKey = `${mapping.prefix}.${key}`;

            values[prefixedKey] = (values[prefixedKey] || 0) + value;
          }
        }
      }

      if (Object.keys(values).length === 0) {
        continue;
      }

      const deploymentMetric = this.deploymentMetrics.create({ deploymentId, metricKey: metric.key, values });
      await this.deploymentMetrics.save(deploymentMetric);
    }
  }

  private async getDueMetrics(deploymentId: number, metricDefinitions: MetricDefinition[]) {
    const result: MetricDefinition[] = [];

    for (const metric of metricDefinitions) {
      const intervalMs = parseDurationMs(metric.interval);

      const lastMetric = await this.deploymentMetrics.findOne({
        where: { deploymentId, metricKey: metric.key },
        order: { createdAt: 'DESC' },
      });

      if (lastMetric && intervalMs && Date.now() - lastMetric.createdAt.getTime() < intervalMs - INTERVAL_TOLERANCE_MS) {
        continue;
      }

      result.push(metric);
    }

    return result;
  }
}

export async function trackDeploymentMetrics(param: TrackDeploymentMetricsParam): Promise<any> {
  return param;
}
