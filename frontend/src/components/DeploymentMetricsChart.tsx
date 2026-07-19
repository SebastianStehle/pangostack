import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DeploymentMetricDatapointDto, DeploymentMetricSummaryDto, useClients } from 'src/api';
import { getChartColor } from 'src/lib';
import { texts } from 'src/texts';

const DEFAULT_HOURS = 24;

const CHART_HEIGHT = 250;

const LEGEND_WIDTH = 220;

export interface DeploymentMetricsChartProps {
  // The ID of the deployment.
  deploymentId: number;
}

export const DeploymentMetricsChart = (props: DeploymentMetricsChartProps) => {
  const { deploymentId } = props;
  const clients = useClients();

  const { data: loadedMetrics } = useQuery({
    queryKey: ['deployment-metrics', deploymentId],
    queryFn: () => clients.deployments.getDeploymentMetrics(deploymentId, DEFAULT_HOURS),
  });

  const metrics = useMemo(() => loadedMetrics?.metrics || [], [loadedMetrics]);

  const summaryCards = useMemo(() => {
    return metrics.flatMap(({ key, unit, datapoints, summaries }) =>
      summaries.map((summary) => ({
        id: `${key}_${summary.prefix}_${summary.label}`,
        label: summary.label,
        unit,
        value: buildSummaryValue(datapoints, summary),
      })),
    );
  }, [metrics]);

  const charts = useMemo(() => {
    return metrics
      .filter(({ chart }) => chart === 'bar')
      .map(({ key, label, unit, datapoints }) => ({
        key,
        label,
        unit: unit ? unit.toUpperCase() : null,
        valueKeys: getValueKeys(datapoints),
        data: datapoints.map(({ timestamp, values }) => ({
          time: format(parseISO(timestamp), 'HH:mm'),
          ...values,
        })),
      }));
  }, [metrics]);

  if (metrics.length === 0) {
    return <div className="text-sm">{texts.deployments.metricsEmpty}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {summaryCards.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {summaryCards.map((card) => (
            <div key={card.id} className="stats border-gray-300">
              <div className="stat">
                <div className="stat-title">{card.label}</div>
                <div className="stat-value text-2xl">{card.value}</div>
                {card.unit && <div className="stat-desc">{card.unit.toUpperCase()}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {charts.length > 0 && (
        <div className="flex flex-col gap-8">
          {charts.map((chart) => (
            <div key={chart.key}>
              <h3 className="mb-2 text-sm font-semibold">{chart.label}</h3>

              <ResponsiveContainer height={CHART_HEIGHT}>
                <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis label={chart.unit ? { value: chart.unit, angle: -90, position: 'insideLeft' } : undefined} />
                  <Tooltip formatter={(value) => (chart.unit ? `${value} ${chart.unit}` : value)} />
                  {/* The legend is shown at the right side, so that all charts have the same height. */}
                  <Legend
                    align="right"
                    layout="vertical"
                    verticalAlign="middle"
                    width={LEGEND_WIDTH}
                    wrapperStyle={{ maxHeight: CHART_HEIGHT, overflowY: 'auto', paddingLeft: 16 }}
                  />
                  {chart.valueKeys.map((key, index) => (
                    <Bar key={key} dataKey={key} fill={getChartColor(index)} name={key} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function getValueKeys(datapoints: DeploymentMetricDatapointDto[]) {
  const keys = new Set<string>();

  for (const datapoint of datapoints) {
    for (const key of Object.keys(datapoint.values)) {
      keys.add(key);
    }
  }

  return [...keys].sort();
}

function buildSummaryValue(datapoints: DeploymentMetricDatapointDto[], summary: DeploymentMetricSummaryDto) {
  // The summary either selects a single value or aggregates all values under the prefix into a single number.
  const selectedKey = summary.value ? `${summary.prefix}.${summary.value}` : null;
  const prefix = `${summary.prefix}.`;

  const values: number[] = [];
  for (const datapoint of datapoints) {
    for (const [key, value] of Object.entries(datapoint.values)) {
      if (selectedKey ? key === selectedKey : key.startsWith(prefix)) {
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
