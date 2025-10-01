import { ParameterDefinitionDto } from 'src/api';
import { FormEditorProps, Forms } from 'src/components';
import { texts } from 'src/texts';

export const DeploymentControl = ({
  parameter,
  initialValue,
}: {
  parameter: ParameterDefinitionDto;
  initialValue?: Record<string, any>;
}) => {
  const {
    allowedValues,
    editor,
    hint: hints,
    immutable,
    label,
    maxLength,
    maxValue,
    minValue,
    name,
    placeholder,
    required,
    step,
    type,
  } = parameter;
  const props: FormEditorProps = {
    badge: immutable ? { text: texts.common.immutable, tooltip: texts.deployments.immutableTooltip } : undefined,
    hints,
    label: label || name,
    name: `parameters.${name}`,
    placeholder: placeholder || undefined,
    required,
  };

  if (type === 'boolean') {
    return <Forms.Boolean {...props} />;
  } else if (type === 'number' && maxValue) {
    return <Forms.Range {...props} max={maxValue || undefined} min={minValue || undefined} step={step || undefined} />;
  } else if (type === 'number') {
    return <Forms.Number {...props} />;
  } else if (type === 'string' && allowedValues && allowedValues.length > 0) {
    let values = allowedValues;
    if (initialValue && parameter.upgradeOnly) {
      const currentValue = initialValue[parameter.name];
      const currentIndex = allowedValues.findIndex((x) => x.value === currentValue);
      if (currentIndex >= 0) {
        values = values.filter((_, i) => i >= currentIndex);
      }
    }

    return <Forms.Select {...props} options={values} />;
  } else if (type === 'string' && editor === 'textarea') {
    return <Forms.Textarea {...props} />;
  } else if (type === 'string') {
    return <Forms.Text {...props} maxLength={maxLength || undefined} />;
  } else {
    return null;
  }
};
