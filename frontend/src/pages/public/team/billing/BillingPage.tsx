import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useClients } from 'src/api';
import { Empty, Icon } from 'src/components';
import { formatDate, formatMoney } from 'src/lib';
import { texts } from 'src/texts';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';

export const BillingPage = () => {
  const { teamId } = useParams();
  const clients = useClients();

  const { data: loadedInvoices, isFetched } = useQuery({
    queryKey: ['invoices', teamId],
    queryFn: () => clients.billing.getInvoices(+teamId!),
  });

  const invoices = loadedInvoices?.items || [];

  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h2 className="grow text-2xl">{texts.billing.headline}</h2>

        <button className="btn btn-success">
          <Icon icon="external-link" size={18} /> {texts.billing.portal}
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>{texts.billing.number}</th>
            <th>{texts.billing.dueDate}</th>
            <th>{texts.common.status}</th>
            <th className="text-right">{texts.billing.amount}</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.number}>
              <td>
                <a
                  className="text-primary inline-flex items-center gap-1 font-semibold hover:underline"
                  href={invoice.downloadLink}
                >
                  <Icon icon="external-link" className="inline-flex" size={14} />
                  {invoice.number}
                </a>
              </td>
              <td>{formatDate(invoice.dueDate)}</td>
              <td>
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td className="text-right font-semibold">{formatMoney(invoice.amount, invoice.currency)}</td>
            </tr>
          ))}

          {isFetched && invoices.length === 0 && (
            <tr>
              <td colSpan={4}>
                <Empty icon="no-document" label={texts.billing.emptyLabel} text={texts.billing.emptyText} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};
