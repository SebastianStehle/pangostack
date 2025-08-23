import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Chargebee, { Invoice as ChargebeeInvoice, Customer, HostedPage, PortalSession } from 'chargebee';
import { endOfDayTimestamp, startOfDayTimestamp } from 'src/lib';
import { BillingError, BillingService, Charges, CreateSubscriptionResult, Invoice, InvoiceStatus } from '../interface';
import { findCustomer, findSubscription } from './utils';

interface ChargebeeConfig {
  apiKey: string;
  planId: string;
  addOnIdCores: string;
  addOnIdStorage: string;
  addOnIdMemory: string;
  addOnIdVolume: string;
  fixedPriceDescription: string;
  site: string;
}

@Injectable()
export class ChargebeeBillingService implements BillingService {
  private readonly chargebee: Chargebee;
  private readonly config: ChargebeeConfig;

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<ChargebeeConfig>('billing.chargebee');

    this.chargebee = new Chargebee(this.config);
    if (!this.chargebee) {
      throw new Error('Charbee has not been created.');
    }
  }

  async hasSubscription(teamId: number, deploymentId: number): Promise<boolean> {
    const subscriptionId = `deployment_${deploymentId}`;
    const subscription = await findSubscription(this.chargebee, subscriptionId);

    return !!subscription && subscription.customer_id !== teamId.toString();
  }

  async createSubscription(
    teamId: number,
    deploymentId: number,
    confirmUrl: string,
    cancelUrl: string,
  ): Promise<CreateSubscriptionResult> {
    try {
      const customer = await this.getOrCreateCustomer(teamId);

      const subscriptionId = `deployment_${deploymentId}`;
      const subscription = await findSubscription(this.chargebee, subscriptionId);
      if (subscription) {
        return true;
      }

      const createSession = async () => {
        const payload: HostedPage.CheckoutNewInputParam = {
          cancel_url: cancelUrl,
          customer: { id: customer.id },
          redirect_url: confirmUrl,
          subscription: {
            id: subscriptionId,
            plan_id: this.config.planId,
            plan_quantity: undefined,
          },
        };

        const session = await this.chargebee.hostedPage.checkoutNew(payload);
        return session;
      };

      if (customer.card_status !== 'valid' || !customer.billing_address?.country) {
        const session = await createSession();
        return { redirectTo: session.hosted_page.url! };
      }

      try {
        const result = await this.chargebee.subscription.createForCustomer(customer.id, {
          id: subscriptionId,
          plan_id: this.config.planId,
          plan_quantity: undefined,
        });

        if (!result.subscription) {
          throw new Error(`Failed to create or retrieve customer. Got statatus code ${result.httpStatusCode}.`);
        }
      } catch {
        const session = await createSession();
        return { redirectTo: session.hosted_page.url! };
      }

      return true;
    } catch (ex) {
      throw new BillingError(`Chargebee: Failed to create subscription for deployment ${deploymentId}`, ex);
    }
  }

  async chargeDeployment(teamId: number, deploymentId: number, charges: Charges): Promise<any> {
    try {
      const customer = await this.getOrCreateCustomer(teamId);

      const subscriptionId = `deployment_${deploymentId}`;
      const subscription = await findSubscription(this.chargebee, subscriptionId);
      if (!subscription || subscription.customer_id !== customer.id) {
        throw new Error(`Cannot find subscription for deployment ${deploymentId}.`);
      }

      let date_from = startOfDayTimestamp(charges.dateFrom);
      let date_to = endOfDayTimestamp(charges.dateTo);

      if (date_from < subscription.created_at!) {
        date_from = subscription.created_at! + 1;
      }

      if (date_to < subscription.created_at!) {
        date_to = subscription.created_at! + 1;
      }

      const addCharge = async (addonId: string, units: number, pricePerUnit: number) => {
        if (units === 0 || pricePerUnit === 0) {
          return;
        }

        const result = await this.chargebee.subscription.chargeAddonAtTermEnd(subscription.id, {
          addon_id: addonId,
          addon_quantity: units,
          addon_unit_price: pricePerUnit * 100,
          date_from,
          date_to,
        });

        if (result.httpStatusCode && result.httpStatusCode >= 400) {
          throw new BillingError(`Failed to add addon, got status {result.httpStatusCode}`);
        }
      };

      await addCharge(this.config.addOnIdCores, charges.totalCoreHours, charges.pricePerCoreHour);
      await addCharge(this.config.addOnIdMemory, charges.totalMemoryGBHours, charges.pricePerMemoryGBHour);
      await addCharge(this.config.addOnIdVolume, charges.totalVolumeGBHours, charges.pricePerVolumeGBHour);
      await addCharge(this.config.addOnIdStorage, charges.totalStorageGB, charges.pricePerStorageGBMonth);

      if (charges.fixedPrice) {
        await this.chargebee.subscription.addChargeAtTermEnd(subscription.id, {
          amount: charges.fixedPrice * 100,
          date_from,
          date_to,
          description: this.config.fixedPriceDescription,
        });
      }
    } catch (ex) {
      throw new BillingError(`Chargebee: Failed to charge deployment ${deploymentId}`, ex);
    }
  }

  async getBillingPortalLink(teamId: number, redirectUrl?: string): Promise<string> {
    const customer = await this.getOrCreateCustomer(teamId);

    const payload: PortalSession.CreateInputParam = { customer };
    if (isAllowedPort(redirectUrl)) {
      payload.redirect_url = redirectUrl;
    } else if (redirectUrl) {
      payload.redirect_url = 'http://invalid.com';
    }

    const session = await this.chargebee.portalSession.create(payload);
    return session.portal_session.access_url;
  }

  async getInvoices(teamId: number, deploymentId?: number): Promise<Invoice[]> {
    const result: Invoice[] = [];
    const customer = await this.getOrCreateCustomer(teamId);

    const query: ChargebeeInvoice.ListInputParam = { customer_id: { is: customer.id }, limit: 12 };
    if (deploymentId) {
      query.subscription_id = { is: `deployment_${deploymentId}` };
    }

    do {
      const response = await this.chargebee.invoice.list(query);

      for (const { invoice } of response.list) {
        if (invoice.total === 0 || !invoice.due_date) {
          continue;
        }

        const pdfResponse = await this.chargebee.invoice.pdf(invoice.id);

        let status: InvoiceStatus = 'Paid';
        if (invoice.status === 'voided') {
          status = 'Voided';
        } else if (invoice.status === 'paid') {
          status = 'Paid';
        } else if (invoice.status === 'payment_due') {
          status = 'PaymentDue';
        } else if (invoice.status === 'not_paid') {
          status = 'NotPaid';
        } else if (invoice.status === 'pending') {
          status = 'Pending';
        }

        result.push({
          amount: invoice.total! * 0.01,
          currency: invoice.currency_code,
          dueDate: new Date((invoice.due_date || invoice.date)! * 1000),
          downloadLink: pdfResponse.download.download_url,
          number: invoice.id,
          status,
        });

        if (result.length === 12) {
          break;
        }
      }

      query.offset = response.next_offset;
    } while (query.offset && result.length < 12);

    return result;
  }

  private async getOrCreateCustomer(teamId: number): Promise<Customer> {
    const id = `team_${teamId}`;

    const customer1 = await findCustomer(this.chargebee, id);
    if (customer1) {
      return customer1;
    }

    try {
      const { customer: createdCustomer } = await this.chargebee.customer.create({ id });
      if (createdCustomer) {
        return createdCustomer;
      }
    } catch (ex) {
      if (ex.http_status_code !== 409) {
        throw ex;
      }
    }

    const customer2 = await findCustomer(this.chargebee, id);
    if (customer2) {
      return customer2;
    }

    throw new Error(`Failed to create or retrieve customer.`);
  }
}

const ALLOWED_PORTS = [443, 80, 8443, 8080];

function isAllowedPort(source?: string): boolean {
  if (!source) {
    return false;
  }

  try {
    const url = new URL(source);

    const port = url.port ? parseInt(url.port) : url.protocol === 'https:' ? 443 : 80;
    return ALLOWED_PORTS.includes(port);
  } catch {
    return false;
  }
}
