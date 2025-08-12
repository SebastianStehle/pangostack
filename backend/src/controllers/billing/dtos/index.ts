import { ApiProperty } from '@nestjs/swagger';
import { Invoice, InvoiceStatus } from 'src/domain/billing';

export class InvoiceDto {
  @ApiProperty({
    description: 'The invoice number.',
    required: true,
  })
  number: string;

  @ApiProperty({
    description: 'The download link.',
    required: true,
  })
  downloadLink: string;

  @ApiProperty({
    description: 'The date the invoice has been issued.',
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  dueDate?: Date | null;

  @ApiProperty({
    description: 'The total amount of the invoice.',
    required: true,
  })
  amount: number;

  @ApiProperty({
    description: 'The status of the invoice.',
    required: true,
    enum: ['Paid', 'PaymentDue', 'NotPaid', 'Voided', 'Pending'],
  })
  status: InvoiceStatus;

  @ApiProperty({
    description: 'The currency.',
    required: true,
  })
  currency: string;

  static fromDomain(source: Invoice): InvoiceDto {
    const result = new InvoiceDto();
    result.number = source.number;
    result.downloadLink = source.downloadLink;
    result.dueDate = source.dueDate;
    result.amount = source.amount;
    result.currency = source.currency;
    result.status = source.status;
    return result;
  }
}

export class InvoicesDto {
  @ApiProperty({
    description: 'The invoices.',
    required: true,
    type: [InvoiceDto],
  })
  items: InvoiceDto[];

  static fromDomain(source: Invoice[]): InvoicesDto {
    const result = new InvoicesDto();
    result.items = source.map(InvoiceDto.fromDomain);
    return result;
  }
}

export class BillingStatusDto {
  @ApiProperty({
    description: 'Defines whether everything is configured properly.',
    nullable: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'The checkout link.',
    nullable: true,
  })
  portalLink?: string;

  static valid() {
    const result = new BillingStatusDto();
    result.isValid = true;

    return result;
  }

  static invalid(portalLink: string) {
    const result = new BillingStatusDto();
    result.portalLink = portalLink;

    return result;
  }
}
