import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: {
    text: 'Something went wrong while deploying your instance.',
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMarkdown: Story = {
  args: {
    text: 'The deployment **failed**. See the [documentation](https://example.com) for details.',
  },
};
