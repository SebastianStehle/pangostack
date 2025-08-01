import { Injectable } from '@nestjs/common';
import { BillingService, Invoice } from '../interface';

@Injectable()
export class NoopBillingService implements BillingService {
  getCardDetailsLink(): Promise<string | null> {
    return Promise.resolve(null);
  }

  getBillingPortalLink(): Promise<string | null> {
    return Promise.resolve(null);
  }

  hasPaymentDetails(): Promise<boolean> {
    return Promise.resolve(true);
  }

  createSubscription(): Promise<any> {
    return Promise.resolve(true);
  }

  chargeDeployment(): Promise<any> {
    return Promise.resolve(true);
  }

  getInvoices(): Promise<Invoice[]> {
    return Promise.resolve([]);
  }
}
