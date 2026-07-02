import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DeploymentMetricSeriesDto, DeploymentMetricSummaryDto, useClients } from 'src/api';
import { texts } from 'src/texts';

const COLORS = ['#4E79A7', '#F28E2B', '#59A14F', '#B07AA1', '#E15759', '#76B7B2'];

const DEFAULT_HOURS = 24;

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
    return metrics.flatMap((metric) =>
      metric.summaries.map((summary) => ({
        id: `${metric.key}_${summary.prefix}_${summary.label}`,
        label: summary.label,
        unit: metric.unit,
        value: buildSummaryValue(metric, summary),
      })),
    );
  }, [metrics]);

  const charts = useMemo(() => {
    return metrics
      .filter((metric) => metric.chart === 'bar')
      .map((metric) => ({
        key: metric.key,
        label: formatMetricLabel(metric),
        valueKeys: getValueKeys(metric),
        data: metric.datapoints.map((datapoint) => ({
          time: format(parseISO(datapoint.timestamp), 'HH:mm'),
          ...datapoint.values,
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
            <div key={card.id} className="stats border-slate-300 shadow-sm">
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
        <div className="grid grid-cols-2 gap-4">
          {charts.map((chart) => (
            <div key={chart.key}>
              <h3 className="mb-2 text-sm font-semibold">{chart.label}</h3>

              <ResponsiveContainer height={250}>
                <BarChart width={500} height={300} data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {chart.valueKeys.map((key, index) => (
                    <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} name={key} />
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

function formatMetricLabel(metric: DeploymentMetricSeriesDto) {
  return metric.unit ? `${metric.label} (${metric.unit.toUpperCase()})` : metric.label;
}

function getValueKeys(metric: DeploymentMetricSeriesDto) {
  const keys = new Set<string>();

  for (const datapoint of metric.datapoints) {
    for (const key of Object.keys(datapoint.values)) {
      keys.add(key);
    }
  }

  return [...keys].sort();
}

function buildSummaryValue(metric: DeploymentMetricSeriesDto, summary: DeploymentMetricSummaryDto) {
  const prefix = `${summary.prefix}.`;
  const valuesByKey: Record<string, number[]> = {};

  for (const datapoint of metric.datapoints) {
    for (const [key, value] of Object.entries(datapoint.values)) {
      if (key.startsWith(prefix)) {
        valuesByKey[key] ||= [];
        valuesByKey[key].push(Number(value));
      }
    }
  }

  const parts = Object.entries(valuesByKey).map(([key, values]) => ({
    key: key.substring(prefix.length),
    value: roundValue(aggregate(values, summary.type)),
  }));

  if (parts.length === 0) {
    return '-';
  }

  if (parts.length === 1) {
    return `${parts[0].value}`;
  }

  return parts.map((x) => `${x.key}: ${x.value}`).join(', ');
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
