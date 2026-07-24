import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MarkdownEditor } from './MarkdownEditor';

const meta = {
  title: 'Components/MarkdownEditor',
  component: MarkdownEditor,
  args: {
    value: '# Release notes\n\nWrite your **markdown** here.',
    onChange: fn(),
  },
} satisfies Meta<typeof MarkdownEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    value: '',
  },
};
