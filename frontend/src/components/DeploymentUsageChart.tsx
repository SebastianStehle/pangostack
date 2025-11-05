import { useQuery } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useClients } from 'src/api';
import { texts } from 'src/texts';

export interface DeploymentUsageChartProps {
  // The ID of the deployment.
  deploymentId: number;
}

export const DeploymentUsageChart = (props: DeploymentUsageChartProps) => {
  const { deploymentId } = props;
  const clients = useClients();

  const { data: loadedUsage } = useQuery({
    queryKey: ['deployment-usage', deploymentId],
    queryFn: () => {
      const now = new Date();
      const dateFrom = format(addDays(now, -30), 'yyyy-MM-dd');
      const dateTo = format(now, 'yyyy-MM-dd');

      return clients.deployments.getDeploymentUsage(deploymentId, dateFrom, dateTo);
    },
  });

  const data = loadedUsage?.summaries || [];

  return (
    <div className="grid grid-cols-2 gap-4">
      <ResponsiveContainer height={250}>
        <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalCores" fill="#F28E2B" name={texts.deployments.totalCors} />
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer height={250}>
        <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalMemoryGB" fill="#4E79A7" name={texts.deployments.totalMemoryGB} />
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer height={250}>
        <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalVolumeGB" fill="#59A14F" name={texts.deployments.totalVolumeGB} />
        </BarChart>
      </ResponsiveContainer>

      <ResponsiveContainer height={250}>
        <BarChart width={500} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="totalStorageGB" fill="#B07AA1" name={texts.deployments.totalStorageGB} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
