import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { RefreshButton } from './RefreshButton';

const meta = {
  title: 'Components/RefreshButton',
  component: RefreshButton,
  args: {
    onClick: fn(),
    isLoading: false,
    sm: false,
  },
} satisfies Meta<typeof RefreshButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Small: Story = {
  args: {
    sm: true,
  },
};
