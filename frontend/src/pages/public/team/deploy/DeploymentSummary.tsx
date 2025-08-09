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

  const payPerUse = useMemo(() => {
    const context = {
      parameters: values.parameters,
    };

    if (service.pricingModel === 'fixed') {
      return [];
    }

    const buildRow = (label: string, formula: string, price: number, unitFactorLabel: string, factor: number, unit = '') => {
      const totalUnits = +evaluateExpression(formula, context);
      const totalPrice = totalUnits * price * factor;

      return { totalPrice, totalUnits, label, price, factor, unit, unitFactorLabel };
    };

    return [
      buildRow(
        texts.deployments.resourceCores, //
        service.totalCores,
        service.pricePerCoreHour,
        texts.common.perHour,
        30 * 24,
      ),
      buildRow(
        texts.deployments.resourceMemory,
        service.totalMemoryGB,
        service.pricePerMemoryGBHour,
        texts.common.perHour,
        30 * 24,
        'GB',
      ),
      buildRow(
        texts.deployments.resourceVolumes,
        service.totalVolumeGB,
        service.pricePerVolumeGBHour,
        texts.common.perHour,
        1,
        'GB',
      ),
      buildRow(
        texts.deployments.resourceStorage,
        service.totalStorageGB,
        service.pricePerStorageGBMonth,
        texts.common.perMonth,
        1,
        'GB',
      ),
    ];
  }, [service, values]);

  const plan = useMemo(() => {
    const context = {
      parameters: values.parameters,
    };

    const amount = service.prices
      .map((price) => {
        const target = evaluateExpression(price.target, context);
        if (target === price.test) {
          return price.amount;
        } else {
          return 0;
        }
      })
      .reduce((a, c) => a + c, 0);

    return amount;
  }, [service.prices, values.parameters]);

  const total = useMemo(() => {
    return payPerUse.reduce((a, c) => a + c.totalPrice, 0) + service.fixedPrice + plan;
  }, [payPerUse, plan, service.fixedPrice]);

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
          {payPerUse.map((row) => (
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

          {service.pricingModel === 'fixed' && (
            <tr>
              <td className="px-0" colSpan={7}>
                {texts.deployments.fixedPrice}
              </td>
              <td className="px-0 text-right">{formatMoney(plan, service.currency)}</td>
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
}
