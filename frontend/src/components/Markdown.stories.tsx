import type { Meta, StoryObj } from '@storybook/react-vite';
import { Markdown } from './Markdown';

const SAMPLE = `# Getting started

Deploy your instance in a few steps:

1. Pick a **region**.
2. Choose a *plan*.
3. Click deploy.

Visit the [documentation](https://example.com) for more.

\`\`\`bash
pangostack deploy --region eu-central-1
\`\`\`
`;

const meta = {
  title: 'Components/Markdown',
  component: Markdown,
  args: {
    children: SAMPLE,
  },
} satisfies Meta<typeof Markdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rich: Story = {};

export const Inline: Story = {
  args: {
    children: 'A short paragraph with a [link](https://example.com) and `inline code`.',
  },
};
