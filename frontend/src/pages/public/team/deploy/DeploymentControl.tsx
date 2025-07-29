import { ParameterDefinitionDto } from 'src/api';
import { Forms } from 'src/components';

export const DeploymentControl = ({ parameter }: { parameter: ParameterDefinitionDto }) => {
  const { maxValue, minValue, maxLength, step, name, label, hint, type } = parameter;

  if (type === 'boolean') {
    return <Forms.Boolean name={name} label={label || name} hints={hint} />;
  } else if (type === 'number' && maxValue) {
    return <Forms.Range name={name} label={label || name} hints={hint} min={minValue} max={maxValue} step={step} />;
  } else if (type === 'number') {
    return <Forms.Number name={name} label={label || name} hints={hint} />;
  } else if (type === 'string') {
    return <Forms.Text name={name} label={label || name} hints={hint} maxLength={maxLength} />;
  } else {
    return null;
  }
};
