import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan } from 'typeorm';
import { DeploymentEntity, DeploymentMetricEntity, DeploymentMetricRepository, DeploymentRepository } from 'src/domain/database';
import { parseDurationMs } from 'src/lib';
import { WorkflowConfig } from '../config';
import { Activity } from '../registration';

const DEFAULT_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export type CleanupDeploymentMetricsParams = object;

@Activity(cleanupDeploymentsMetrics)
export class CleanupDeploymentMetricsActivity implements Activity<CleanupDeploymentMetricsParams, any> {
  private readonly maxAgeMs: number;
  private readonly maxCount: number;

  constructor(
    configService: ConfigService,
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentMetricEntity)
    private readonly deploymentMetrics: DeploymentMetricRepository,
  ) {
    const config = configService.getOrThrow<WorkflowConfig>('workflow').metrics;

    this.maxAgeMs = parseDurationMs(config.maxAge) || DEFAULT_MAX_AGE_MS;
    this.maxCount = config.maxCount;
  }

  async execute() {
    const now = Date.now();

    // The global maximum age wins over any keep interval from the definitions.
    await this.deploymentMetrics.delete({ createdAt: LessThan(new Date(now - this.maxAgeMs)) });

    const deployments = await this.deployments.find({
      relations: ['updates', 'updates.serviceVersion'],
    });

    for (const deployment of deployments) {
      const update = [...(deployment.updates || [])].sort((a, b) => b.id - a.id).find((x) => x.status === 'Completed');
      if (!update) {
        continue;
      }

      for (const metric of update.serviceVersion.definition.metrics || []) {
        const keepMs = parseDurationMs(metric.keep);

        if (keepMs && keepMs < this.maxAgeMs) {
          await this.deploymentMetrics.delete({
            createdAt: LessThan(new Date(now - keepMs)),
            deploymentId: deployment.id,
            metricKey: metric.key,
          });
        }

        await this.cleanupByCount(deployment.id, metric.key);
      }
    }
  }

  private async cleanupByCount(deploymentId: number, metricKey: string) {
    // The IDs are auto-incremented, therefore everything before the oldest metric to keep can be deleted directly.
    const [oldestToKeep] = await this.deploymentMetrics.find({
      where: { deploymentId, metricKey },
      order: { id: 'DESC' },
      skip: this.maxCount - 1,
      take: 1,
    });

    if (!oldestToKeep) {
      return;
    }

    await this.deploymentMetrics.delete({ deploymentId, metricKey, id: LessThan(oldestToKeep.id) });
  }
}

export async function cleanupDeploymentsMetrics(param: CleanupDeploymentMetricsParams): Promise<any> {
  return param;
}
