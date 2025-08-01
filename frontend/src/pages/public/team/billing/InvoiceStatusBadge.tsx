import { InvoiceDtoStatusEnum } from 'src/api';
import { texts } from 'src/texts';

export const InvoiceStatusBadge = ({ status }: { status: InvoiceDtoStatusEnum }) => {
  switch (status) {
    case 'Paid':
      return <div className="badge badge-success me-1 rounded-full font-normal">{texts.billing.paid}</div>;

    case 'NotPaid':
      return <div className="badge badge-error me-1 rounded-full font-normal">{texts.billing.notPaid}</div>;

    case 'PaymentDue':
      return <div className="badge badge-warning me-1 rounded-full font-normal">{texts.billing.paymentDue}</div>;

    case 'Voided':
      return <div className="badge badge-neutral me-1 rounded-full font-normal">{texts.billing.voided}</div>;

    default:
      return <div className="badge badge-secondary me-1 rounded-full font-normal">{texts.billing.pending}</div>;
  }
};
