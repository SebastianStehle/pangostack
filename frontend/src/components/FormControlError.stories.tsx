import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormControlError } from './FormControlError';

const meta = {
  title: 'Components/FormControlError',
  component: FormControlError,
  args: {
    error: 'This field is required.',
    submitCount: 1,
    touched: true,
    alignment: 'left',
  },
  argTypes: {
    alignment: {
      control: 'inline-radio',
      options: ['left', 'right'],
    },
  },
  decorators: [
    (Story) => (
      <div className="relative h-12 w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormControlError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const HiddenWhenUntouched: Story = {
  args: {
    submitCount: 0,
    touched: false,
  },
};
