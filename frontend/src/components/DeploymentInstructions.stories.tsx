import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeploymentDto } from 'src/api';
import { DeploymentInstructions } from './DeploymentInstructions';

// Only `deployment.parameters` is read by the component, so a minimal object is cast to the DTO.
const deployment = {
  parameters: { domain: 'app.example.com', adminEmail: 'admin@example.com' },
} as unknown as DeploymentDto;

const meta = {
  title: 'Components/DeploymentInstructions',
  component: DeploymentInstructions,
  args: {
    deployment,
    text: '## Access your instance\n\nOpen [https://${parameters.domain}](https://${parameters.domain}) and sign in as **${parameters.adminEmail}**.',
  },
} satisfies Meta<typeof DeploymentInstructions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithParameters: Story = {};

export const PlainText: Story = {
  args: {
    text: 'Your instance is ready. No further configuration is required.',
  },
};
