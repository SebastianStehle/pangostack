import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { NumberInput } from './NumberInput';

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  args: {
    className: 'input input-bordered',
    placeholder: 'Enter a number',
    onChange: fn(),
  },
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue: 42,
  },
};
