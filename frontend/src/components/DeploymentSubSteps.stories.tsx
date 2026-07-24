import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeploymentSubStepDto, DeploymentSubStepDtoStatusEnum } from 'src/api';
import { DeploymentSubSteps } from './DeploymentSubSteps';

const START = new Date('2026-07-24T10:00:00Z');

const subStep = (
  id: number,
  name: string,
  status: DeploymentSubStepDtoStatusEnum,
  extra?: Partial<DeploymentSubStepDto>,
): DeploymentSubStepDto => ({
  id,
  name,
  status,
  error: null,
  logs: [],
  startedAt: START,
  completedAt: status === DeploymentSubStepDtoStatusEnum.Running ? null : new Date(START.getTime() + id * 5000),
  ...extra,
});

const meta = {
  title: 'Components/DeploymentSubSteps',
  component: DeploymentSubSteps,
  args: {
    subSteps: [
      subStep(1, 'Pulling image', DeploymentSubStepDtoStatusEnum.Completed, {
        logs: [{ timestamp: START, message: 'Pulled nginx:latest' }],
      }),
      subStep(2, 'Creating container', DeploymentSubStepDtoStatusEnum.Completed),
      subStep(3, 'Waiting for health check', DeploymentSubStepDtoStatusEnum.Running),
    ],
  },
} satisfies Meta<typeof DeploymentSubSteps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};

export const WithFailure: Story = {
  args: {
    subSteps: [
      subStep(1, 'Pulling image', DeploymentSubStepDtoStatusEnum.Completed),
      subStep(2, 'Starting container', DeploymentSubStepDtoStatusEnum.Failed, {
        error: 'Exited with code 1',
      }),
    ],
  },
};
