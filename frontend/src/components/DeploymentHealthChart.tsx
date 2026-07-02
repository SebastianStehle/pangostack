import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useClients } from 'src/api';
import { CHART_COLOR_FAILURE, CHART_COLOR_SUCCESS } from 'src/lib';
import { texts } from 'src/texts';

const UNIT_CHECKS = 'CHECKS';

export interface DeploymentHealthChartProps {
  // The ID of the deployment.
  deploymentId: number;
}

export const DeploymentHealthChart = (props: DeploymentHealthChartProps) => {
  const { deploymentId } = props;
  const clients = useClients();

  const { data: loadedUsage } = useQuery({
    queryKey: ['deployment-checks', deploymentId],
    queryFn: () => {
      const now = new Date();
      const dateFrom = format(addDays(now, -30), 'yyyy-MM-dd');
      const dateTo = format(now, 'yyyy-MM-dd');

      return clients.deployments.getDeploymentChecks(deploymentId, dateFrom, dateTo);
    },
  });

  const data = loadedUsage?.checks || [];

  return (
    <ResponsiveContainer height={300}>
      <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: UNIT_CHECKS, angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value} ${UNIT_CHECKS}`} />
        <Legend />
        <Bar dataKey="totalFailures" stackId="a" fill={CHART_COLOR_FAILURE} name={texts.deployments.totalFailures}>
          {data.map((entry) => (
            <Cell key={`fail-${entry.date}`} />
          ))}
        </Bar>
        <Bar dataKey="totalSuccesses" stackId="a" fill={CHART_COLOR_SUCCESS} name={texts.deployments.totalSuccesses}>
          {data.map((entry) => (
            <Cell key={`success-${entry.date}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
