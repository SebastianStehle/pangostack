import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeploymentMetricSeriesDto } from 'src/api';
import { DeploymentMetricSummaryCards } from './DeploymentMetricSummaryCards';

const datapoints = Array.from({ length: 6 }, (_, i) => ({
  timestamp: new Date(Date.UTC(2026, 6, 24, 8 + i)).toISOString(),
  values: {
    'cpu.used': 40 + i * 3,
    'memory.used': 2 + i * 0.25,
  },
}));

const metrics: DeploymentMetricSeriesDto[] = [
  {
    key: 'cpu',
    label: 'CPU',
    unit: '%',
    chart: 'line',
    datapoints,
    summaries: [{ label: 'Peak CPU', type: 'max', prefix: 'cpu', value: 'used' }],
  },
  {
    key: 'memory',
    label: 'Memory',
    unit: 'gb',
    chart: 'line',
    datapoints,
    summaries: [{ label: 'Avg Memory', type: 'avg', prefix: 'memory', value: 'used' }],
  },
];

const meta = {
  title: 'Components/DeploymentMetricSummaryCards',
  component: DeploymentMetricSummaryCards,
  args: {
    metrics,
  },
} satisfies Meta<typeof DeploymentMetricSummaryCards>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    metrics: [],
  },
};
