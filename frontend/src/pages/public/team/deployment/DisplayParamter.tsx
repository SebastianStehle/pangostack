import { useMemo } from 'react';
import { DeploymentDto, ParameterDefinitionDto } from 'src/api';
import { PropertyColumn } from './PropertyColumn';

export interface DisplayParameterProps {
  // The deployment that contains the parameters.
  deployment: DeploymentDto;

  // The actual property.
  parameter: ParameterDefinitionDto;
}

export const DisplayParameter = (props: DisplayParameterProps) => {
  const { deployment, parameter } = props;

  const value = useMemo(() => {
    let result = deployment.parameters[parameter.name];

    if (parameter.allowedValues && parameter.allowedValues.length > 0) {
      const allowedValue = parameter.allowedValues.find((x) => x.value == result);

      result = allowedValue?.label || result;
    }

    return result;
  }, [deployment.parameters, parameter.allowedValues, parameter.name]);

  return <PropertyColumn label={parameter.label || parameter.name} value={value} />;
};
