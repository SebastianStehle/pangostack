import type { Meta, StoryObj } from '@storybook/react-vite';
import LogViewer from './LogViewer';

const MESSAGES = [
  '[10:00:01] Starting deployment...',
  '[10:00:02] Pulling image nginx:latest',
  '[10:00:08] Creating container',
  '[10:00:09] Container started',
  '[10:00:10] Deployment completed successfully',
].join('\n');

const meta = {
  title: 'Components/LogViewer',
  component: LogViewer,
  args: {
    messages: MESSAGES,
  },
} satisfies Meta<typeof LogViewer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    messages: '',
  },
};
