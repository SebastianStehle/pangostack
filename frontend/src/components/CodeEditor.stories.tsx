import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CodeEditor } from './CodeEditor';

const YAML_SAMPLE = `service: my-app
version: 1.4.2
resources:
  - type: vultr-vm
    region: fra
    plan: vc2-2c-4gb
`;

const meta = {
  title: 'Components/CodeEditor',
  component: CodeEditor,
  args: {
    value: YAML_SAMPLE,
    mode: 'yaml',
    valueMode: 'string',
    height: '200px',
    onChange: fn(),
  },
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['yaml', 'javascript'],
    },
    valueMode: {
      control: 'inline-radio',
      options: ['string', 'object'],
    },
  },
} satisfies Meta<typeof CodeEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Yaml: Story = {};

export const ReadOnly: Story = {
  args: {
    disabled: true,
  },
};
