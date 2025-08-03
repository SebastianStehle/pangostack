import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Chargebee, { Invoice as ChargebeeInvoice, Customer, HostedPage, PortalSession } from 'chargebee';
import { endOfDayTimestamp, startOfDayTimestamp } from 'src/lib';
import { BillingService, Charges, Invoice, InvoiceStatus } from '../interface';

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

  async createSubscription(teamId: number, deploymentId: number): Promise<any> {
    const customer = await this.getOrCreateCustomer(teamId);

    const { subscription } = await this.chargebee.subscription.retrieve(`deployment_${deploymentId}`);
    if (subscription) {
      return;
    }

    const result = await this.chargebee.subscription.create({
      id: `deployment_${deploymentId}`,
      customer,
      plan_id: this.config.planId,
    });

    if (!result.subscription) {
      throw new Error(`Failed to create or retrieve customer. Got statatus code ${result.httpStatusCode}.`);
    }
  }

  async chargeDeployment(teamId: number, deploymentId: number, charges: Charges): Promise<any> {
    const customer = await this.getOrCreateCustomer(teamId);

    const { subscription } = await this.chargebee.subscription.retrieve(`deployment_${deploymentId}`);
    if (!subscription || subscription.customer_id !== customer.id) {
      throw new Error(`Cannot find subscription for deployment ${deploymentId}.`);
    }

    const date_from = startOfDayTimestamp(charges.dateFrom);
    const date_to = endOfDayTimestamp(charges.dateTo);

    const addCharge = async (addonId: string, units: number, pricePerUnit: number) => {
      if (units === 0 || pricePerUnit === 0) {
        return;
      }

      await this.chargebee.subscription.chargeAddonAtTermEnd(subscription.id, {
        addon_id: addonId,
        addon_quantity: units,
        addon_unit_price: pricePerUnit * 100,
        date_from,
        date_to,
      });
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

  async getCardDetailsLink(teamId: number, redirectUrl?: string): Promise<string> {
    const customer = await this.getOrCreateCustomer(teamId);

    const payload: HostedPage.CheckoutOneTimeInputParam = {
      customer,
      currency_code: 'EUR',
      charges: [{ description: 'Setup Fee', amount: 1 }],
    };
    if (isAllowedPort(redirectUrl)) {
      payload.redirect_url = redirectUrl;
    } else if (redirectUrl) {
      payload.redirect_url = 'http://invalid.com';
    }

    const session = await this.chargebee.hostedPage.checkoutOneTime(payload);
    return session.hosted_page.url;
  }

  async hasPaymentDetails(teamId: number): Promise<boolean> {
    try {
      const customer = await this.getOrCreateCustomer(teamId);

      return customer && customer.card_status === 'valid' && customer.billing_address.validation_status === 'valid';
    } catch (error) {
      console.log(error);
      throw error;
    }
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
          amount: invoice.total! * 0.1,
          currency: invoice.currency_code,
          dueDate: new Date(invoice.due_date! * 1000),
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

    try {
      const { customer: retrievedCustomer } = await this.chargebee.customer.retrieve(id);
      if (retrievedCustomer) {
        return retrievedCustomer;
      }
    } catch (error: any) {
      if (error.http_status_code !== 404) {
        throw error;
      }
    }

    try {
      const { customer: createdCustomer } = await this.chargebee.customer.create({ id });
      if (createdCustomer) {
        return createdCustomer;
      }
    } catch (error: any) {
      if (error.http_status_code !== 409) {
        throw error;
      }
    }

    const { customer: resolvedCustomer, httpStatusCode } = await this.chargebee.customer.retrieve(id);
    if (resolvedCustomer) {
      return resolvedCustomer;
    }

    throw new Error(`Failed to create or retrieve customer. Got statatus code ${httpStatusCode}.`);
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
    console.log(port);
    return ALLOWED_PORTS.includes(port);
  } catch (e) {
    return false;
  }
}
