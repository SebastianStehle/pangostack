export interface Invoice {
  // The invoice number.
  number: string;

  // The download link.
  downloadLink: string;

  // The date the invoice has been issued.
  dueDate: Date;

  // The status of the invoice.
  status: InvoiceStatus;

  // The total amount of the invoice.
  amount: number;

  // The currency.
  currency: string;
}

export type InvoiceStatus = 'Paid' | 'PaymentDue' | 'NotPaid' | 'Voided' | 'Pending';

export interface Charges {
  // The price per CPU and hour in the selected currency.
  pricePerCpuHour: number;

  // The price per Memory in GB and hour in the selected currency.
  pricePerMemoryGbHour: number;

  // The price per Storage in GB and hour in the selected currency.
  pricePerStorageGbMonth: number;

  // The price per Disk in GB and hour in the selected currency.
  pricePerVolumeGbHour: number;

  // The additional fixed price.
  fixedPrice: number;

  // The total CPU hours.
  totalCpuHours: number;

  // The total Memory GB hours.
  totalMemoryGbHours: number;

  // The total Disk GB hours.
  totalVolumeGbHours: number;

  // The total storage.
  totalStorageGB: number;

  // The start of the billing period.
  dateFrom: Date;

  // The end of the billing period.
  dateTo: Date;
}

export abstract class BillingService {
  abstract getBillingPortalLink(teamId: number, redirectUrl?: string): Promise<string | null>;

  abstract getCardDetailsLink(teamId: number, redirectUrl?: string): Promise<string | null>;

  abstract hasPaymentDetails(teamId: number): Promise<boolean>;

  abstract createSubscription(teamId: number, deploymentId: number): Promise<any>;

  abstract chargeDeployment(teamId: number, deploymentId: number, charges: Charges): Promise<any>;

  abstract getInvoices(teamId: number, deploymentId?: number): Promise<Invoice[]>;
}

export interface BillingProvider {
  get(): BillingService;
}
