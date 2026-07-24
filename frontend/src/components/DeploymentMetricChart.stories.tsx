import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeploymentMetricSeriesDto } from 'src/api';
import { DeploymentMetricChart } from './DeploymentMetricChart';

const datapoints = Array.from({ length: 12 }, (_, i) => {
  const timestamp = new Date(Date.UTC(2026, 6, 24, 8 + i)).toISOString();

  return {
    timestamp,
    values: {
      used: Math.round(30 + Math.sin(i / 2) * 20 + i),
      total: 100,
    },
  };
});

const lineMetric: DeploymentMetricSeriesDto = {
  key: 'cpu',
  label: 'CPU usage',
  unit: '%',
  chart: 'line',
  summaries: [],
  datapoints,
};

const meta = {
  title: 'Components/DeploymentMetricChart',
  component: DeploymentMetricChart,
  args: {
    metric: lineMetric,
  },
} satisfies Meta<typeof DeploymentMetricChart>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {};

export const Bar: Story = {
  args: {
    metric: {
      ...lineMetric,
      key: 'requests',
      label: 'Requests per hour',
      unit: null,
      chart: 'bar',
    },
  },
};
