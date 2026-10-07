import { EventEmitter2 } from '@nestjs/event-emitter';
import { BillingFailedEvent } from 'src/domain/events';
import { Activity } from '../registration';

export type ReportBillingFailuresParam = {
  dateFrom: string;
  dateTo: string;
  failures: { deploymentId: number; error: string }[];
};

@Activity(reportBillingFailures)
export class ReportBillingFailuresActivity implements Activity<ReportBillingFailuresParam> {
  constructor(private readonly events: EventEmitter2) {}

  async execute({ dateFrom, dateTo, failures }: ReportBillingFailuresParam) {
    this.events.emit(BillingFailedEvent.TYPE, new BillingFailedEvent(dateFrom, dateTo, failures));
  }
}

export async function reportBillingFailures(param: ReportBillingFailuresParam): Promise<any> {
  return param;
}
