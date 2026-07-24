import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page } from './Page';

const meta = {
  title: 'Components/Page',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: (
      <div className="prose">
        <h1>Deployments</h1>
        <p>This is the page content area. It scrolls independently from the menu.</p>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div className="relative flex h-[500px] w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Page>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutMenu: Story = {};

export const WithMenu: Story = {
  args: {
    menu: (
      <ul className="menu w-full p-4">
        <li>
          <a className="active">Overview</a>
        </li>
        <li>
          <a>Resources</a>
        </li>
        <li>
          <a>Logs</a>
        </li>
        <li>
          <a>Settings</a>
        </li>
      </ul>
    ),
  },
};
