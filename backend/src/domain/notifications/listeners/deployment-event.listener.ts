import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { DeploymentEntity, DeploymentRepository } from 'src/domain/database';
import {
  DeploymentDegradedEvent,
  DeploymentReadyEvent,
  DeploymentRecoveredEvent,
  DeploymentUpdatedEvent,
} from 'src/domain/events';
import { last, UrlService } from 'src/lib';
import { NotificationsService } from '../services';
import { Topics } from '../topics';

@Injectable()
export class DeploymentEventListener {
  private readonly logger = new Logger(DeploymentEventListener.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly urlService: UrlService,
    @InjectRepository(DeploymentEntity)
    private readonly deployments: DeploymentRepository,
  ) {}

  @OnEvent(DeploymentReadyEvent.TYPE, { async: true, promisify: true })
  async onDeploymentReady(event: DeploymentReadyEvent) {
    await this.notifyTeam(event.deploymentId, 'DEPLOYMENT_CREATED');
  }

  @OnEvent(DeploymentUpdatedEvent.TYPE, { async: true, promisify: true })
  async onDeploymentUpdated(event: DeploymentUpdatedEvent) {
    await this.notifyTeam(event.deploymentId, 'DEPLOYMENT_UPDATED');
  }

  @OnEvent(DeploymentDegradedEvent.TYPE, { async: true, promisify: true })
  async onDeploymentDegraded(event: DeploymentDegradedEvent) {
    await this.notifyTeam(event.deploymentId, 'DEPLOYMENT_UNHEALTHY');
  }

  @OnEvent(DeploymentRecoveredEvent.TYPE, { async: true, promisify: true })
  async onDeploymentRecovered(event: DeploymentRecoveredEvent) {
    await this.notifyTeam(event.deploymentId, 'DEPLOYMENT_HEALTHY');
  }

  private async notifyTeam(deploymentId: number, templateCode: string) {
    const deployment = await this.deployments.findOne({
      where: { id: deploymentId },
      relations: ['service', 'updates', 'updates.serviceVersion'],
      order: { updates: { id: 'ASC' } },
    });

    if (!deployment) {
      this.logger.warn(`Deployment ${deploymentId} was deleted before '${templateCode}' could be sent.`);
      return;
    }

    const { id, name, service, teamId, updates } = deployment;
    const url = this.urlService.deploymentUrl(teamId, id);

    // The properties are part of the contract with the notification templates, so keep them stable.
    const properties = {
      id: `${id}`,
      name: name || service.name,
      serviceName: service.name,
      serviceVersion: last(updates)?.serviceVersion.name ?? '',
      teamId: `${teamId}`,
      url,
    };

    await this.notifications.notify(Topics.team(teamId), templateCode, properties, url);
  }
}
