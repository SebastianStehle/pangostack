import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useClients } from 'src/api';
import { texts } from 'src/texts';
import { DeploymentMetricChart } from './DeploymentMetricChart';
import { DeploymentMetricSummaryCards } from './DeploymentMetricSummaryCards';

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

  if (metrics.length === 0) {
    return <div className="text-sm">{texts.deployments.metricsEmpty}</div>;
  }

  const charts = metrics.filter(({ chart }) => chart === 'bar' || chart === 'line');

  return (
    <div className="flex flex-col gap-8">
      <DeploymentMetricSummaryCards metrics={metrics} />

      {charts.length > 0 && (
        <div className="flex flex-col gap-8">
          {charts.map((metric) => (
            <DeploymentMetricChart key={metric.key} metric={metric} />
          ))}
        </div>
      )}
    </div>
  );
};
