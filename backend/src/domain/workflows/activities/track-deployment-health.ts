import { setTimeout as delay } from 'timers/promises';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentCheckEntity,
  DeploymentCheckRepository,
  DeploymentEntity,
  DeploymentRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
} from 'src/domain/database';
import { evaluateHealthChecks } from 'src/domain/definitions';
import { DeploymentDegradedEvent, DeploymentRecoveredEvent } from 'src/domain/events';
import { getEvaluationContext } from 'src/domain/services';
import { Activity } from '../registration';
import { computeHealthTransition, HEALTH_CONFIRMATION_CHECKS } from './health-state';

// Short outages, e.g. a container restart, are bridged within a single run before a check counts as failed.
const HEALTH_CHECK_ATTEMPTS = 3;
const HEALTH_CHECK_RETRY_DELAY_MS = 10_000;
const HEALTH_CHECK_TIMEOUT_MS = 10_000;

// Must match the length of the log column.
const MAX_CHECK_LOG_LENGTH = 512;

export type TrackDeploymentHealthParam = { deploymentId: number };

export type TrackDeploymentResult = 'Unchanged' | 'Undefined' | 'BecomeDegraded' | 'BecomeHealthy';

@Activity(trackDeploymentHealth)
export class TrackDeploymentHealthActivity implements Activity<TrackDeploymentHealthParam> {
  constructor(
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
    private readonly events: EventEmitter2,
  ) {}

  async execute({ deploymentId }: TrackDeploymentHealthParam): Promise<TrackDeploymentResult> {
    const updates = await this.deploymentUpdates.find({
      where: { deploymentId },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });

    if (updates.length === 0) {
      // Throw an error to make the tracking easier.
      throw new NotFoundException(`Update for deployment ${deploymentId} not found`);
    }

    const update = updates.find((x) => x.status === 'Completed');
    if (!update) {
      // Deployment has not been completed yet. This is normal behavior.
      return 'Unchanged';
    }

    const { context, definition } = getEvaluationContext(update);

    const urls: string[] = [];
    for (const resource of definition.resources) {
      for (const { url } of evaluateHealthChecks(resource, context)) {
        urls.push(url);
      }
    }

    if (urls.length === 0) {
      return 'Undefined';
    }

    const results = await Promise.all(urls.map((url) => this.check(url)));
    const status = results.every((x) => x.ok) ? 'Succeeded' : 'Failed';
    const log = results
      .map((x) => x.message)
      .join('\n')
      .substring(0, MAX_CHECK_LOG_LENGTH);

    await this.deploymentChecks.save(this.deploymentChecks.create({ deploymentId, status, log }));

    const deployment = await this.deployments.findOneBy({ id: deploymentId });
    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    const recentChecks = await this.deploymentChecks.find({
      where: { deploymentId },
      order: { id: 'DESC' },
      take: HEALTH_CONFIRMATION_CHECKS,
    });

    const { state, notify } = computeHealthTransition(
      deployment,
      recentChecks.map((x) => x.status),
      new Date(),
    );

    if (
      state.healthStatus !== deployment.healthStatus ||
      state.notifiedHealthStatus !== deployment.notifiedHealthStatus ||
      state.healthNotifiedAt !== deployment.healthNotifiedAt
    ) {
      await this.deployments.update({ id: deploymentId }, state);
    }

    const { name, teamId } = deployment;
    if (notify === 'Degraded') {
      this.events.emit(DeploymentDegradedEvent.TYPE, new DeploymentDegradedEvent(teamId, deploymentId, name));
      return 'BecomeDegraded';
    } else if (notify === 'Healthy') {
      this.events.emit(DeploymentRecoveredEvent.TYPE, new DeploymentRecoveredEvent(teamId, deploymentId, name));
      return 'BecomeHealthy';
    }

    return 'Unchanged';
  }

  private async check(url: string) {
    let message = '';
    for (let attempt = 1; attempt <= HEALTH_CHECK_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS) });
        if (response.ok) {
          return { ok: true, message: `Request to '${url}' succeeded with ${response.status}` };
        }

        message = `Request to '${url}' failed with ${response.status}`;
      } catch (ex) {
        message = `Request to '${url}' failed with exception: ${ex}`;
      }

      if (attempt < HEALTH_CHECK_ATTEMPTS) {
        await delay(HEALTH_CHECK_RETRY_DELAY_MS);
      }
    }

    return { ok: false, message: `${message} (after ${HEALTH_CHECK_ATTEMPTS} attempts)` };
  }
}

export async function trackDeploymentHealth(param: TrackDeploymentHealthParam): Promise<TrackDeploymentResult> {
  return param as any;
}
