import type { Meta, StoryObj } from '@storybook/react-vite';
import { PropertyColumn } from './PropertyColumn';

const meta = {
  title: 'Components/PropertyColumn',
  component: PropertyColumn,
  args: {
    label: 'Region',
    value: 'eu-central-1',
  },
} satisfies Meta<typeof PropertyColumn>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithValue: Story = {};

export const WithChildren: Story = {
  args: {
    label: 'Status',
    value: undefined,
    children: <span className="badge badge-success">Running</span>,
  },
};
