import type { Meta, StoryObj } from '@storybook/react-vite';
import { DeploymentDto, ParameterDefinitionDto } from 'src/api';
import { DeploymentDisplayParameter } from './DeploymentDisplayParameter';

// Only `deployment.parameters` is read by the component, so a minimal object is cast to the DTO.
const deployment = {
  parameters: { region: 'fra', plan: 'vc2-2c-4gb' },
} as unknown as DeploymentDto;

const baseParameter: ParameterDefinitionDto = {
  name: 'region',
  type: 'string',
  required: true,
  immutable: null,
  display: null,
  label: 'Region',
  hint: null,
  placeholder: null,
  defaultValue: null,
  allowedValues: null,
  minValue: null,
  maxValue: null,
  minLength: null,
  step: null,
  maxLength: null,
  editor: null,
  section: null,
};

const meta = {
  title: 'Components/DeploymentDisplayParameter',
  component: DeploymentDisplayParameter,
  args: {
    deployment,
    parameter: baseParameter,
  },
} satisfies Meta<typeof DeploymentDisplayParameter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RawValue: Story = {};

export const MappedFromAllowedValues: Story = {
  args: {
    parameter: {
      ...baseParameter,
      allowedValues: [
        { value: 'fra', label: 'Frankfurt', hint: null, updateFrom: null },
        { value: 'ams', label: 'Amsterdam', hint: null, updateFrom: null },
      ],
    },
  },
};
