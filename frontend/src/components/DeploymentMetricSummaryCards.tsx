import { useMemo } from 'react';
import { DeploymentMetricDatapointDto, DeploymentMetricSeriesDto, DeploymentMetricSummaryDto } from 'src/api';

export interface DeploymentMetricSummaryCardsProps {
  // The metrics whose summaries are shown as headline cards.
  metrics: DeploymentMetricSeriesDto[];
}

export const DeploymentMetricSummaryCards = (props: DeploymentMetricSummaryCardsProps) => {
  const { metrics } = props;

  const cards = useMemo(() => {
    return metrics.flatMap(({ key, unit, datapoints, summaries }) =>
      summaries.map((summary) => ({
        id: `${key}_${summary.prefix}_${summary.label}`,
        label: summary.label,
        unit,
        value: buildSummaryValue(datapoints, summary),
      })),
    );
  }, [metrics]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.id} className="stats border-gray-300">
          <div className="stat">
            <div className="stat-title">{card.label}</div>
            <div className="stat-value text-2xl">{card.value}</div>
            {card.unit && <div className="stat-desc">{card.unit.toUpperCase()}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

function buildSummaryValue(datapoints: DeploymentMetricDatapointDto[], summary: DeploymentMetricSummaryDto) {
  // The summary either selects a single value or aggregates all values under the prefix into a single number.
  const selectedKey = summary.value ? `${summary.prefix}.${summary.value}` : null;
  const selectedPrefix = `${summary.prefix}.`;

  const values: number[] = [];
  for (const datapoint of datapoints) {
    for (const [key, value] of Object.entries(datapoint.values)) {
      if (selectedKey ? key === selectedKey : key.startsWith(selectedPrefix)) {
        values.push(Number(value));
      }
    }
  }

  if (values.length === 0) {
    return '-';
  }

  return `${roundValue(aggregate(values, summary.type))}`;
}

function aggregate(values: number[], type: DeploymentMetricSummaryDto['type']) {
  if (values.length === 0) {
    return 0;
  }

  if (type === 'max') {
    return Math.max(...values);
  }

  return values.reduce((a, c) => a + c, 0) / values.length;
}

function roundValue(value: number) {
  return Math.round(value * 100) / 100;
}
