import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { ServicePublicDto } from 'src/api';
import { evaluateExpression, formatMoney } from 'src/lib';
import { texts } from 'src/texts';

interface DeploymentSummaryProps {
  // The service.
  service: ServicePublicDto;
}

export function DeploymentSummary(props: DeploymentSummaryProps) {
  const { service } = props;
  const values = useWatch();

  const rows = useMemo(() => {
    const context = {
      parameters: values,
    };

    const buildRow = (label: string, formula: string, price: number, unitFactorLabel: string, factor: number, unit = '') => {
      const totalUnits = +evaluateExpression(formula, context);
      const totalPrice = totalUnits * price * factor;

      return { totalPrice, totalUnits, label, price, factor, unit, unitFactorLabel };
    };

    return [
      buildRow(
        texts.deployments.resourceCores, //
        service.totalCpus,
        service.pricePerCpuHour,
        texts.common.perHour,
        30 * 24,
      ),
      buildRow(
        texts.deployments.resourceMemory,
        service.totalMemory,
        service.pricePerMemoryGbHour,
        texts.common.perHour,
        30 * 24,
        'GB',
      ),
      buildRow(
        texts.deployments.resourceVolumes,
        service.totalStorage,
        service.pricePerVolumeGbHour,
        texts.common.perHour,
        1,
        'GB',
      ),
      buildRow(
        texts.deployments.resourceStorage,
        service.totalVolumeSize,
        service.pricePerStorageGbMonth,
        texts.common.perMonth,
        1,
        'GB',
      ),
    ];
  }, [service, values]);

  const total = useMemo(() => {
    console.log(JSON.stringify(rows, undefined, 2));
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
              <td className="px-1">*</td>
              <td className="ps-0 text-right">{formatMoney(row.price, service.currency)}</td>
              <td className="px-0 text-xs">/ {row.unitFactorLabel}</td>
              <td className="px-1">=</td>
              <th className="px-0 text-right">{formatMoney(row.totalPrice, service.currency)}</th>
            </tr>
          ))}

          <tr>
            <td className="px-0" colSpan={7}>
              {texts.deployments.fixedPrice}
            </td>
            <td className="px-0 text-right">{formatMoney(service.fixedPrice, service.currency)}</td>
          </tr>

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
}
