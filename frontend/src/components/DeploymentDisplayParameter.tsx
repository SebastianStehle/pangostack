import { useMemo } from 'react';
import { DeploymentDto, ParameterDefinitionDto } from 'src/api';
import { texts } from 'src/texts';
import { PropertyColumn } from './PropertyColumn';

// Booleans can be stored as actual booleans or as their string representation.
const TRUE_VALUES = new Set([true, 'true', '1']);
const FALSE_VALUES = new Set([false, 'false', '0']);

export interface DeploymentDisplayParameterProps {
  // The deployment that contains the parameters.
  deployment: DeploymentDto;

  // The actual property.
  parameter: ParameterDefinitionDto;
}

export const DeploymentDisplayParameter = (props: DeploymentDisplayParameterProps) => {
  const { deployment, parameter } = props;

  const value = useMemo(() => {
    const result = deployment.parameters[parameter.name];

    if (parameter.type === 'boolean') {
      if (TRUE_VALUES.has(result)) {
        return texts.common.yes;
      }

      if (FALSE_VALUES.has(result)) {
        return texts.common.no;
      }
    }

    if (parameter.allowedValues && parameter.allowedValues.length > 0) {
      const allowedValue = parameter.allowedValues.find((x) => x.value == result);

      return allowedValue?.label || result;
    }

    return result;
  }, [deployment.parameters, parameter.allowedValues, parameter.name, parameter.type]);

  // Empty or missing values would otherwise render as a blank cell.
  const display = value == null || value === '' ? '-' : value;

  return <PropertyColumn label={parameter.label || parameter.name} value={display} />;
};
