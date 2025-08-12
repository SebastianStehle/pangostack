export interface Invoice {
  // The invoice number.
  number: string;

  // The download link.
  downloadLink: string;

  // The date the invoice has been issued.
  dueDate?: Date | null;

  // The status of the invoice.
  status: InvoiceStatus;

  // The total amount of the invoice.
  amount: number;

  // The currency.
  currency: string;
}

export type InvoiceStatus = 'Paid' | 'PaymentDue' | 'NotPaid' | 'Voided' | 'Pending';

export interface Charges {
  // The price per Core and hour in the selected currency.
  pricePerCoreHour: number;

  // The price per Memory in GB and hour in the selected currency.
  pricePerMemoryGBHour: number;

  // The price per Storage in GB and hour in the selected currency.
  pricePerStorageGBMonth: number;

  // The price per Disk in GB and hour in the selected currency.
  pricePerVolumeGBHour: number;

  // The additional fixed price.
  fixedPrice: number;

  // The total Core hours.
  totalCoreHours: number;

  // The total Memory GB hours.
  totalMemoryGBHours: number;

  // The total Disk GB hours.
  totalVolumeGBHours: number;

  // The total storage.
  totalStorageGB: number;

  // The start of the billing period.
  dateFrom: string;

  // The end of the billing period.
  dateTo: string;
}

export class BillingError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(`${message}: ${cause?.constructor.name || 'Type'}, ${cause?.message || 'Unknown cause'}`);
  }
}

export type CreateSubscriptionResult = true | { redirectTo: string };

export abstract class BillingService {
  abstract getBillingPortalLink(teamId: number, redirectUrl?: string): Promise<string | null>;

  abstract createSubscription(
    teamId: number,
    deploymentId: number,
    confirmUrl: string,
    cancelUrl: string,
  ): Promise<CreateSubscriptionResult>;

  abstract hasSubscription(teamId: number, deploymentid: number): Promise<boolean>;

  abstract chargeDeployment(teamId: number, deploymentId: number, charges: Charges): Promise<any>;

  abstract getInvoices(teamId: number, deploymentId?: number): Promise<Invoice[]>;
}

export interface BillingProvider {
  get(): BillingService;
}
