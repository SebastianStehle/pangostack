import type { Meta, StoryObj } from '@storybook/react-vite';
import { Empty } from './Empty';

const meta = {
  title: 'Components/Empty',
  component: Empty,
  args: {
    icon: 'no-document',
    label: 'No deployments yet',
    text: 'Create your first deployment to get started.',
  },
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoDocument: Story = {};

export const NoConnection: Story = {
  args: {
    icon: 'no-connection',
    label: 'Connection lost',
    text: 'We could not reach the server. Please try again.',
  },
};
