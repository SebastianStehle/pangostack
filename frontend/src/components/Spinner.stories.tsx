import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  args: {
    visible: true,
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const Large: Story = {
  args: {
    className: 'h-10 w-10',
  },
};
