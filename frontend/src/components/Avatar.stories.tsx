import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    user: { name: 'Ada Lovelace' },
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const WithPicture: Story = {
  args: {
    user: { name: 'Ada Lovelace', picture: 'https://i.pravatar.cc/80?img=5' },
  },
};

export const BrokenPictureFallsBackToInitials: Story = {
  args: {
    user: { name: 'Grace Hopper', picture: 'https://invalid.example/does-not-exist.png' },
  },
};
