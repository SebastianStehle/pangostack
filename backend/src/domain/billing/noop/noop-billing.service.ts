import { Injectable } from '@nestjs/common';
import { BillingService, Invoice } from '../interface';

@Injectable()
export class NoopBillingService implements BillingService {
  hasSubscription(): Promise<boolean> {
    return Promise.resolve(true);
  }

  getBillingPortalLink(): Promise<string | null> {
    return Promise.resolve(null);
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
