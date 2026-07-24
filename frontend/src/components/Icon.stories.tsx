import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, IconType } from './Icon';

const allIcons: IconType[] = [
  'activity',
  'alert-circle',
  'alert',
  'arrow-left',
  'arrow-up',
  'bar-chart',
  'bird',
  'check-circle',
  'chevron-right',
  'clipboard',
  'close',
  'droplet',
  'edit',
  'external-link',
  'eye-off',
  'file-text',
  'info',
  'monitor',
  'more-horizontal',
  'more-vertical',
  'no-connection',
  'no-document',
  'pie-chart',
  'plus',
  'refresh',
  'search',
  'server',
  'terminal',
  'thumb-down',
  'thumb-up',
  'trash',
  'user',
  'users',
];

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: {
    icon: 'server',
    size: 24,
  },
  argTypes: {
    icon: {
      control: 'select',
      options: allIcons,
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const Large: Story = {
  args: {
    icon: 'activity',
    size: 64,
  },
};

export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4 sm:grid-cols-6">
      {allIcons.map((icon) => (
        <div key={icon} className="flex flex-col items-center gap-2 text-center text-xs">
          <Icon icon={icon} size={28} />
          <span>{icon}</span>
        </div>
      ))}
    </div>
  ),
};
