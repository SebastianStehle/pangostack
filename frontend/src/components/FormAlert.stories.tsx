import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormAlert } from './FormAlert';

const meta = {
  title: 'Components/FormAlert',
  component: FormAlert,
  args: {
    common: 'The form could not be submitted.',
    error: new Error('Name is already taken.'),
  },
} satisfies Meta<typeof FormAlert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithError: Story = {};

export const NoErrorRendersNothing: Story = {
  args: {
    error: null,
  },
};
