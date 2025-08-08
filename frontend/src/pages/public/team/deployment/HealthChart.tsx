import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useClients } from 'src/api';

export interface HealthChartProps {
  // The ID of the team.
  teamId: number;

  // The ID of the deployment.
  deploymentId: number;
}

export function HealthChart(props: HealthChartProps) {
  const { deploymentId, teamId } = props;
  const clients = useClients();

  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();

    const dateFrom = format(addDays(now, -30), 'yyyy-MM-dd');
    const dateTo = format(now, 'yyyy-MM-dd');

    return { dateFrom, dateTo };
  }, []);

  const { data: loadedUsage } = useQuery({
    queryKey: [teamId, 'deployments', deploymentId, 'checks', dateFrom, dateTo],
    queryFn: () => clients.deployments.getDeploymentChecks(+teamId!, +deploymentId!, dateFrom, dateTo),
    refetchOnWindowFocus: false,
  });

  const data = loadedUsage?.checks || [];

  return (
    <ResponsiveContainer height={300}>
      <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalFailures" stackId="a" fill="red" />
        <Bar dataKey="totalSuccesses" stackId="a" fill="green" />
      </BarChart>
    </ResponsiveContainer>
  );
}
