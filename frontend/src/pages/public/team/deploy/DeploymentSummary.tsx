import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { ServicePublicDto } from 'src/api';
import { evaluateExpression, formatMoney, isNumber } from 'src/lib';
import { texts } from 'src/texts';

interface DeploymentSummaryProps {
  // The service.
  service: ServicePublicDto;
}

type Row = {
  label: string;
  price: number;
  totalPrice: number;
  totalUnits: string;
  unit: string;
  period: string;
};

export const DeploymentSummary = (props: DeploymentSummaryProps) => {
  const { service } = props;
  const values = useWatch();

  const rows = useMemo(() => {
    const context = {
      parameters: values.parameters,
    };

    const rows: Row[] = [];
    const addRow = (label: string, formula: string | null, price: number, factor: number, period: string, unit: string) => {
      if (!formula) {
        return null;
      }

      const totalUnits = +evaluateExpression(formula, context);
      const totalPrice = totalUnits * price * factor;

      if (!isNumber(totalUnits)) {
        return;
      }

      rows.push({ totalPrice, totalUnits: `${totalUnits}`, label, price, unit, period });
    };

    addRow(
      texts.deployments.resourceCores, //
      service.totalCores,
      service.pricePerCoreHour,
      30 * 24,
      texts.common.perHour,
      '',
    );

    addRow(
      texts.deployments.resourceMemory, //
      service.totalMemoryGB,
      service.pricePerMemoryGBHour,
      30 * 24,
      texts.common.perHour,
      'GB',
    );

    addRow(
      texts.deployments.resourceVolumes, //
      service.totalVolumeGB,
      service.pricePerVolumeGBHour,
      1,
      texts.common.perHour,
      'GB',
    );

    addRow(
      texts.deployments.resourceStorage, //
      service.totalStorageGB,
      service.pricePerStorageGBMonth,
      1,
      texts.common.perMonth,
      'GB',
    );

    for (const price of service.prices) {
      const target = evaluateExpression(price.target, context);
      if (target === price.test) {
        const totalPrice = 30 * 24 * price.amount;

        rows.push({
          label: price.label,
          period: texts.common.perHour,
          price: price.amount,
          totalPrice,
          totalUnits: '',
          unit: '',
        });
      }
    }

    return rows;
  }, [service, values]);

  const total = useMemo(() => {
    return rows.reduce((a, c) => a + c.totalPrice, 0) + service.fixedPrice;
  }, [rows, service.fixedPrice]);

  return (
    <>
      <table className="table table-fixed">
        <colgroup>
          <col />
          <col className="w-[30px]" />
          <col className="w-[30px]" />
          <col className="w-[20px]" />
          <col className="w-[50px]" />
          <col className="w-[60px]" />
          <col className="w-[10px]" />
          <col />
        </colgroup>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="px-0">{row.label}</td>
              <td className="px-0">{row.totalUnits}</td>
              <td className="px-0 text-xs">{row.unit}</td>
              <td className="px-1">{row.totalUnits ? '*' : ''}</td>
              <td className="ps-0 text-right">{formatMoney(row.price, service.currency)}</td>
              <td className="px-0 text-xs">/ {row.period}</td>
              <td className="px-1">=</td>
              <th className="px-0 text-right">{formatMoney(row.totalPrice, service.currency)}</th>
            </tr>
          ))}

          {service.fixedPrice > 0 && (
            <tr>
              <td className="px-0" colSpan={7}>
                {texts.deployments.basePrice}
              </td>
              <td className="px-0 text-right">{formatMoney(service.fixedPrice, service.currency)}</td>
            </tr>
          )}

          <tr>
            <th className="px-0" colSpan={7}>
              {texts.common.totalPrice}
            </th>
            <th className="px-0 text-right">{formatMoney(total, service.currency)}</th>
          </tr>
        </tbody>
      </table>
    </>
  );
};
