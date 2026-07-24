import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Search } from './Search';

const meta = {
  title: 'Components/Search',
  component: Search,
  args: {
    onSearch: fn(),
  },
} satisfies Meta<typeof Search>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithValue: Story = {
  args: {
    value: 'production',
  },
};
