import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BillingFailedEvent } from 'src/domain/events';
import { NotificationsService } from '../services';
import { Topics } from '../topics';

@Injectable()
export class BillingEventListener {
  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent(BillingFailedEvent.TYPE, { async: true, promisify: true })
  async onBillingFailed({ dateFrom, dateTo, failures }: BillingFailedEvent) {
    await this.notifications.notify(Topics.admins, 'BILLING_FAILED', {
      dateFrom,
      dateTo,
      failedCount: `${failures.length}`,
      deploymentIds: failures.map((x) => x.deploymentId).join(', '),
      errors: failures.map((x) => `${x.deploymentId}: ${x.error}`).join('\n'),
    });
  }
}
