import { ApiProperty } from '@nestjs/swagger';
import { Invoice, InvoiceStatus } from 'src/domain/billing';

export class InvoiceDto {
  @ApiProperty({
    description: 'The invoice number.',
    nullable: false,
  })
  number: string;

  @ApiProperty({
    description: 'The download link.',
    nullable: false,
  })
  downloadLink: string;

  @ApiProperty({
    description: 'The date the invoice has been issued.',
    nullable: false,
    type: 'string',
    format: 'date-time',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'The total amount of the invoice.',
    nullable: false,
  })
  amount: number;

  @ApiProperty({
    description: 'The status of the invoice.',
    nullable: false,
    enum: ['Paid', 'PaymentDue', 'NotPaid', 'Voided', 'Pending'],
  })
  status: InvoiceStatus;

  @ApiProperty({
    description: 'The currency.',
    nullable: false,
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
    nullable: false,
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
