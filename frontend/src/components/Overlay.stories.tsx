import type { Meta, StoryObj } from '@storybook/react-vite';
import { OverlayDropdown } from './Overlay';

const meta = {
  title: 'Components/OverlayDropdown',
  component: OverlayDropdown,
  args: {
    placement: 'bottom-start',
    button: ({ isOpen }) => <button className="btn btn-primary">Actions {isOpen ? '▲' : '▼'}</button>,
    children: (
      <ul className="dropdown-menu w-48">
        <li>
          <a>Edit</a>
        </li>
        <li>
          <a>Duplicate</a>
        </li>
        <li>
          <a className="text-error">Delete</a>
        </li>
      </ul>
    ),
  },
} satisfies Meta<typeof OverlayDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};
