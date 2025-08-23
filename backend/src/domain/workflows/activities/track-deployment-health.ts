import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentCheckEntity,
  DeploymentCheckRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
} from 'src/domain/database';
import { evaluateHealthChecks } from 'src/domain/definitions';
import { getEvaluationContext } from 'src/domain/services';
import { Activity } from '../registration';

export type TrackDeploymentHealthParam = { deploymentId: number };

@Activity(trackDeploymentHealth)
export class TrackDeploymentHealthActivity implements Activity<TrackDeploymentHealthParam> {
  constructor(
    @InjectRepository(DeploymentUpdateEntity)
    private readonly deploymentUpdates: DeploymentUpdateRepository,
    @InjectRepository(DeploymentCheckEntity)
    private readonly deploymentChecks: DeploymentCheckRepository,
  ) {}

  async execute({ deploymentId }: TrackDeploymentHealthParam) {
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
      return;
    }

    const { context, definition } = getEvaluationContext(update);

    const log: string[] = [];

    let numFailed = 0;
    let numSucceeded = 0;
    for (const resource of definition.resources) {
      const healthChecks = evaluateHealthChecks(resource, context);
      if (healthChecks.length === 0) {
        continue;
      }

      for (const healtCheck of healthChecks) {
        try {
          const result = await fetch(healtCheck.url);

          if (result.ok) {
            numSucceeded++;
            log.push(`Request to '${healtCheck.url} succeeded with ${result.status}`);
          } else {
            numFailed++;
            log.push(`Request to '${healtCheck.url} failed with ${result.status}`);
          }
        } catch (ex) {
          log.push(`Request to '${healtCheck.url} failed with exception: ${ex}`);
          numFailed++;
        }
      }
    }

    if (numFailed === 0 && numSucceeded === 0) {
      return;
    }

    const status = numFailed > 0 ? 'Failed' : 'Succeeded';

    const deploymentCheck = this.deploymentChecks.create({ deploymentId, status, log: log.join('\n') });
    await this.deploymentChecks.save(deploymentCheck);
  }
}

export async function trackDeploymentHealth(param: TrackDeploymentHealthParam): Promise<any> {
  return param;
}
