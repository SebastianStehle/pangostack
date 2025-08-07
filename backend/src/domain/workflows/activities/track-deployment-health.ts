import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeploymentCheckEntity,
  DeploymentCheckRepository,
  DeploymentUpdateEntity,
  DeploymentUpdateRepository,
} from 'src/domain/database';
import { evaluateHealthChecks } from 'src/domain/definitions';
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
    const update = await this.deploymentUpdates.findOne({
      where: { deploymentId, status: 'Completed' },
      order: { id: 'DESC' },
      relations: ['serviceVersion'],
    });

    if (!update) {
      throw new NotFoundException(`Update for deployment ${deploymentId} not found`);
    }

    const definition = update.serviceVersion.definition;
    const context = { env: {}, context: {}, parameters: update.parameters };

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
          log.push(`Request to '${healtCheck.url} failed with exception`);
          numFailed++;
        }
      }
    }

    if (numFailed === 0 && numSucceeded === 0) {
      return;
    }

    const status = numFailed > 0 ? 'Failed' : 'Succeeded';

    await this.deploymentChecks.save({ deploymentId, status, log: log.join('\n') });
  }
}

export async function trackDeploymentHealth(param: TrackDeploymentHealthParam): Promise<any> {
  return param;
}
