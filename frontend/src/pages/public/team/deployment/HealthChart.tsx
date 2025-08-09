import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

  const { data: loadedUsage } = useQuery({
    queryKey: [teamId, 'deployments', deploymentId, 'checks'],
    queryFn: () => {
      const now = new Date();
      const dateFrom = format(addDays(now, -30), 'yyyy-MM-dd');
      const dateTo = format(now, 'yyyy-MM-dd');
      return clients.deployments.getDeploymentChecks(teamId, deploymentId, dateFrom, dateTo);
    },
    refetchOnWindowFocus: false,
  });

  const data = loadedUsage?.checks || [];

  return (
    <ResponsiveContainer height={300}>
      <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalFailures" stackId="a" fill="red">
          {data.map((entry) => (
            <Cell key={`fail-${entry.date}`} />
          ))}
        </Bar>
        <Bar dataKey="totalSuccesses" stackId="b" fill="green">
          {data.map((entry) => (
            <Cell key={`success-${entry.date}`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
