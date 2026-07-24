import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeploymentDtoStatusEnum } from 'src/api';
import { DeploymentStatus } from './DeploymentStatus';

const meta = {
  title: 'Components/DeploymentStatus',
  component: DeploymentStatus,
  args: {
    status: DeploymentDtoStatusEnum.Completed,
    showLabel: true,
    small: false,
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: [
        DeploymentDtoStatusEnum.Pending,
        DeploymentDtoStatusEnum.Running,
        DeploymentDtoStatusEnum.Completed,
        DeploymentDtoStatusEnum.Failed,
      ],
    },
  },
} satisfies Meta<typeof DeploymentStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Completed: Story = {};

export const Pending: Story = {
  args: {
    status: DeploymentDtoStatusEnum.Pending,
  },
};

export const Running: Story = {
  args: {
    status: DeploymentDtoStatusEnum.Running,
  },
};

export const Failed: Story = {
  args: {
    status: DeploymentDtoStatusEnum.Failed,
  },
};

export const IndicatorOnly: Story = {
  args: {
    showLabel: false,
  },
};

export const SmallRunningIndicator: Story = {
  args: {
    status: DeploymentDtoStatusEnum.Running,
    showLabel: false,
    small: true,
  },
};
