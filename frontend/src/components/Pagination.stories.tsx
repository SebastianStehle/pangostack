import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Pagingation } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagingation,
  args: {
    page: 0,
    pageSize: 10,
    total: 95,
    onPage: fn(),
  },
} satisfies Meta<typeof Pagingation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {};

export const MiddlePage: Story = {
  args: {
    page: 4,
  },
};

export const LastPage: Story = {
  args: {
    page: 9,
  },
};

export const SinglePageHidden: Story = {
  args: {
    total: 5,
  },
};
