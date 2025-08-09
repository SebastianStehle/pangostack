import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useClients } from 'src/api';

export interface UsageChartProps {
  // The ID of the team.
  teamId: number;

  // The ID of the deployment.
  deploymentId: number;
}

export function UsageChart(props: UsageChartProps) {
  const { deploymentId, teamId } = props;
  const clients = useClients();

  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();

    const dateFrom = format(addDays(now, -30), 'yyyy-MM-dd');
    const dateTo = format(now, 'yyyy-MM-dd');

    return { dateFrom, dateTo };
  }, []);

  const { data: loadedUsage } = useQuery({
    queryKey: [teamId, 'deployments', deploymentId, 'usage', dateFrom, dateTo],
    queryFn: () => {
      const now = new Date();
      const dateFrom = format(addDays(now, -30), 'yyyy-MM-dd');
      const dateTo = format(now, 'yyyy-MM-dd');
      return clients.deployments.getDeploymentUsage(teamId, deploymentId, dateFrom, dateTo);
    },
    refetchOnWindowFocus: false,
  });

  const data = loadedUsage?.summaries || [];

  return (
    <ResponsiveContainer height={300}>
      <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalCores" fill="#F28E2B" />
        <Bar dataKey="totalMemoryGB" fill="#4E79A7" />
        <Bar dataKey="totalVolumeGB" fill="#59A14F" />
        <Bar dataKey="totalStorageGB" fill="#B07AA1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
