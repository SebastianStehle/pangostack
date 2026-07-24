import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeploymentDtoHealthStatusEnum } from 'src/api';
import { HealthStatus } from './HealthStatus';

const meta = {
  title: 'Components/HealthStatus',
  component: HealthStatus,
  args: {
    status: DeploymentDtoHealthStatusEnum.Succeeded,
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: [DeploymentDtoHealthStatusEnum.Succeeded, DeploymentDtoHealthStatusEnum.Failed, null],
    },
  },
} satisfies Meta<typeof HealthStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Healthy: Story = {};

export const Unhealthy: Story = {
  args: {
    status: DeploymentDtoHealthStatusEnum.Failed,
  },
};

export const Unchecked: Story = {
  args: {
    status: null,
  },
};
