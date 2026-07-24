import type { Meta, StoryObj } from '@storybook/react-vite';
import { NodeStatus } from './NodeStatus';

const meta = {
  title: 'Components/NodeStatus',
  component: NodeStatus,
  args: {
    isReady: true,
  },
} satisfies Meta<typeof NodeStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const NotReady: Story = {
  args: {
    isReady: false,
    message: 'CrashLoopBackOff',
  },
};
