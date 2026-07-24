import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Modal } from './Modal';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    header: 'Delete deployment',
    onClose: fn(),
    size: 'md',
    children: <p>Are you sure you want to delete this deployment? This action cannot be undone.</p>,
    footer: <button className="btn btn-error">Delete</button>,
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const WithoutFooter: Story = {
  args: {
    footer: undefined,
  },
};
