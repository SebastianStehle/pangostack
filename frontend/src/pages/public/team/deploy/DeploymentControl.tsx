import { ParameterDefinitionDto } from 'src/api';
import { Forms } from 'src/components';

export const DeploymentControl = ({ parameter }: { parameter: ParameterDefinitionDto }) => {
  const { maxValue, minValue, maxLength, step, name, label, hint, type } = parameter;
  const fullName = `parameters.${name}`;

  if (type === 'boolean') {
    return <Forms.Boolean name={fullName} label={label || name} hints={hint} />;
  } else if (type === 'number' && maxValue) {
    return <Forms.Range name={fullName} label={label || name} hints={hint} min={minValue} max={maxValue} step={step} />;
  } else if (type === 'number') {
    return <Forms.Number name={fullName} label={label || name} hints={hint} />;
  } else if (type === 'string') {
    return <Forms.Text name={fullName} label={label || name} hints={hint} maxLength={maxLength} />;
  } else {
    return null;
  }
};
