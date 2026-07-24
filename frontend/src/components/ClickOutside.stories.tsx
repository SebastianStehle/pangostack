import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ClickOutside } from './ClickOutside';

const meta = {
  title: 'Components/ClickOutside',
  component: ClickOutside,
  args: {
    isActive: true,
    onClickOutside: fn(),
    children: (
      <div className="rounded-box border border-gray-300 bg-white p-6">
        Click anywhere outside this box to trigger the handler (see the Actions tab).
      </div>
    ),
  },
} satisfies Meta<typeof ClickOutside>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Inactive: Story = {
  args: {
    isActive: false,
  },
};
