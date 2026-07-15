import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamActivityEntity, TeamActivityRepository } from 'src/domain/database';
import {
  DeploymentConfirmedEvent,
  DeploymentCreatedEvent,
  DeploymentDeletedEvent,
  MemberAddedEvent,
  MemberRemovedEvent,
  PaymentChargedEvent,
  SubscriptionCreatedEvent,
  TeamEvent,
} from 'src/domain/events';

@Injectable()
export class ActivityListener {
  private readonly logger = new Logger(ActivityListener.name);

  constructor(
    @InjectRepository(TeamActivityEntity)
    private readonly activities: TeamActivityRepository,
  ) {}

  @OnEvent(DeploymentCreatedEvent.TYPE, { async: true, promisify: true })
  onDeploymentCreated(event: DeploymentCreatedEvent) {
    return this.persist(DeploymentCreatedEvent.TYPE, event);
  }

  @OnEvent(DeploymentConfirmedEvent.TYPE, { async: true, promisify: true })
  onDeploymentConfirmed(event: DeploymentConfirmedEvent) {
    return this.persist(DeploymentConfirmedEvent.TYPE, event);
  }

  @OnEvent(DeploymentDeletedEvent.TYPE, { async: true, promisify: true })
  onDeploymentDeleted(event: DeploymentDeletedEvent) {
    return this.persist(DeploymentDeletedEvent.TYPE, event);
  }

  @OnEvent(SubscriptionCreatedEvent.TYPE, { async: true, promisify: true })
  onSubscriptionCreated(event: SubscriptionCreatedEvent) {
    return this.persist(SubscriptionCreatedEvent.TYPE, event);
  }

  @OnEvent(PaymentChargedEvent.TYPE, { async: true, promisify: true })
  onPaymentCharged(event: PaymentChargedEvent) {
    return this.persist(PaymentChargedEvent.TYPE, event);
  }

  @OnEvent(MemberAddedEvent.TYPE, { async: true, promisify: true })
  onMemberAdded(event: MemberAddedEvent) {
    return this.persist(MemberAddedEvent.TYPE, event);
  }

  @OnEvent(MemberRemovedEvent.TYPE, { async: true, promisify: true })
  onMemberRemoved(event: MemberRemovedEvent) {
    return this.persist(MemberRemovedEvent.TYPE, event);
  }

  private async persist(key: string, event: TeamEvent) {
    try {
      const entity = this.activities.create({ teamId: event.teamId, key, parameters: { ...event }, createdBy: event.userId });

      await this.activities.save(entity);
    } catch (err) {
      // Logging an activity must never break the operation that triggered it, e.g. a payment.
      this.logger.error(`Failed to log activity '${key}' for team ${event.teamId}.`, err);
    }
  }
}
