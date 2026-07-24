import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DeploymentStepDto,
  DeploymentStepDtoActionEnum,
  DeploymentStepDtoStatusEnum,
  DeploymentSubStepDtoStatusEnum,
  ResourceStatusDto,
} from 'src/api';
import { DeploymentResource } from './DeploymentResource';

const START = new Date('2026-07-24T10:00:00Z');

const runningStep: DeploymentStepDto = {
  resourceId: 'db',
  resourceName: 'Database',
  action: DeploymentStepDtoActionEnum.Deploy,
  status: DeploymentStepDtoStatusEnum.Running,
  attempt: 1,
  maxAttempts: 3,
  error: null,
  logs: [],
  startedAt: START,
  completedAt: null,
  subSteps: [
    {
      id: 1,
      name: 'Provisioning volume',
      status: DeploymentSubStepDtoStatusEnum.Completed,
      error: null,
      logs: [],
      startedAt: START,
      completedAt: new Date(START.getTime() + 4000),
    },
    {
      id: 2,
      name: 'Booting instance',
      status: DeploymentSubStepDtoStatusEnum.Running,
      error: null,
      logs: [{ timestamp: START, message: 'Waiting for SSH...' }],
      startedAt: START,
      completedAt: null,
    },
  ],
};

const status: ResourceStatusDto = {
  resourceId: 'db',
  resourceType: 'vultr-vm',
  resourceName: 'Database',
  workloads: [
    {
      name: 'postgres',
      nodes: [
        { name: 'postgres-0', isReady: true, message: null },
        { name: 'postgres-1', isReady: false, message: 'Pending' },
      ],
    },
  ],
};

const completedStep: DeploymentStepDto = {
  ...runningStep,
  status: DeploymentStepDtoStatusEnum.Completed,
  completedAt: new Date(START.getTime() + 20000),
  subSteps: [
    {
      id: 1,
      name: 'Provisioning volume',
      status: DeploymentSubStepDtoStatusEnum.Completed,
      error: null,
      logs: [],
      startedAt: START,
      completedAt: new Date(START.getTime() + 4000),
    },
    {
      id: 2,
      name: 'Booting instance',
      status: DeploymentSubStepDtoStatusEnum.Completed,
      error: null,
      logs: [],
      startedAt: START,
      completedAt: new Date(START.getTime() + 18000),
    },
  ],
};

const healthyStatus: ResourceStatusDto = {
  ...status,
  workloads: [
    {
      name: 'postgres',
      nodes: [
        { name: 'postgres-0', isReady: true, message: null },
        { name: 'postgres-1', isReady: true, message: null },
      ],
    },
  ],
};

const meta = {
  title: 'Components/DeploymentResource',
  component: DeploymentResource,
  args: {
    name: 'Database',
    step: runningStep,
    connection: {
      url: { value: 'postgres://db.example.com:5432', isPublic: true, label: 'Connection string' },
    },
  },
} satisfies Meta<typeof DeploymentResource>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Running: Story = {};

export const Succeeded: Story = {
  args: {
    step: completedStep,
    status: healthyStatus,
  },
};

export const Failed: Story = {
  args: {
    step: {
      ...runningStep,
      status: DeploymentStepDtoStatusEnum.Failed,
      attempt: 2,
      error: 'Timed out while waiting for the instance to become ready.',
      completedAt: new Date(START.getTime() + 60000),
    },
  },
};

export const WithLiveStatus: Story = {
  args: {
    status,
  },
};

export const StatusLoading: Story = {
  args: {
    step: undefined,
    statusLoading: true,
  },
};
