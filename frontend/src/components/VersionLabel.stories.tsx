import type { Meta, StoryObj } from '@storybook/react-vite';
import { VersionLabel } from './VersionLabel';

const meta = {
  title: 'Components/VersionLabel',
  component: VersionLabel,
  args: {
    version: 'v1.4.2',
    isDefault: false,
  },
} satisfies Meta<typeof VersionLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};

export const Default: Story = {
  args: {
    isDefault: true,
  },
};
