import type { Meta, StoryObj } from '@storybook/react-vite';
import { Image } from './Image';

// The component always requests `${baseUrl}/api/settings/files/${fileId}`. Without a running
// backend that path fails to load, so these stories exercise the fallback rendering path.
const meta = {
  title: 'Components/Image',
  component: Image,
  args: {
    baseUrl: 'https://localhost:3000',
    fileId: 'logo',
    fallback: 'https://placehold.co/200x200?text=Fallback',
    size: '10rem',
  },
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fallback: Story = {};

export const Small: Story = {
  args: {
    size: '4rem',
  },
};
