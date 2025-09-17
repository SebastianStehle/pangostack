import { ParameterDefinitionDto } from 'src/api';
import { Forms } from 'src/components';

export const DeploymentControl = ({ parameter }: { parameter: ParameterDefinitionDto }) => {
  const { allowedValues, editor, maxValue, minValue, maxLength, step, name, label, hint, required, type } = parameter;
  const fullName = `parameters.${name}`;

  if (type === 'boolean') {
    return <Forms.Boolean name={fullName} label={label || name} hints={hint} />;
  } else if (type === 'number' && maxValue) {
    return (
      <Forms.Range
        name={fullName}
        hints={hint}
        label={label || name}
        max={maxValue || undefined}
        min={minValue || undefined}
        step={step || undefined}
      />
    );
  } else if (type === 'number') {
    return <Forms.Number name={fullName} label={label || name} hints={hint} required={required} />;
  } else if (type === 'string' && allowedValues && allowedValues.length > 0) {
    return <Forms.Select name={fullName} label={label || name} hints={hint} required={required} options={allowedValues} />;
  } else if (type === 'string' && editor === 'textarea') {
    return <Forms.Textarea name={fullName} label={label || name} hints={hint} required={required} />;
  } else if (type === 'string') {
    return (
      <Forms.Text name={fullName} label={label || name} hints={hint} required={required} maxLength={maxLength || undefined} />
    );
  } else {
    return null;
  }
};
