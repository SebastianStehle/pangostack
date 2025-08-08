import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { ObjectShape } from 'yup';
import { ParameterDefinitionDto, ServicePublicDto } from 'src/api';
import { FormAlert, Forms } from 'src/components';
import { isNumber } from 'src/lib';
import { texts } from 'src/texts';
import { DeploymentControl } from './DeploymentControl';
import { DeploymentSummary } from './DeploymentSummary';

export interface DeploymentFormProps {
  value?: Record<string, any>;

  // The service.
  service: ServicePublicDto;

  // The error.
  error?: Error;

  // Indicates if the form is running.
  isPending?: boolean;

  // When the form is submitted.
  onSubmit: (value: DeploymentUpdate) => void;

  // When the form is cancelled.
  onCancel?: () => void;
}

export type DeploymentUpdate = { name: string | null; parameters: Record<string, any> };

export function DeploymentForm(props: DeploymentFormProps) {
  const { error, isPending, onCancel, onSubmit, service, value } = props;

  const resolver = useMemo(() => {
    const shape: ObjectShape = {};

    for (const parameter of service.parameters) {
      const label = parameter.label || parameter.name;

      if (parameter.type === 'boolean') {
        let boolean = Yup.bool().label(label);

        if (parameter.required) {
          boolean = boolean.required();
        }

        shape[parameter.name] = boolean;
      } else if (parameter.type === 'number') {
        let number = Yup.number().label(label);

        if (parameter.required) {
          number = number.required();
        }

        if (isNumber(parameter.minValue)) {
          number = number.min(parameter.minValue);
        }

        if (isNumber(parameter.maxValue)) {
          number = number.max(parameter.maxValue);
        }

        shape[parameter.name] = number;
      } else if (parameter.type === 'string') {
        let string = Yup.string().label(label);

        if (parameter.required) {
          string = string.required();
        }

        if (isNumber(parameter.minLength)) {
          string = string.min(parameter.minLength);
        }

        if (isNumber(parameter.maxLength)) {
          string = string.max(parameter.maxLength);
        }

        shape[parameter.name] = string;
      }
    }

    const schema = Yup.object().shape({
      name: Yup.string().max(100).nullable(),

      parameters: Yup.object().shape(shape),
    });

    return yupResolver<DeploymentUpdate>(schema as any);
  }, [service]);

  const defaultValue = useMemo(() => {
    const parameters: Record<string, any> = {};

    for (const parameter of service.parameters) {
      parameters[parameter.name] = parameter.defaultValue;
    }

    return { parameters };
  }, [service]);

  const groupedParameters = useMemo(() => {
    const result: Record<string, ParameterDefinitionDto[]> = {};

    for (const parameter of service.parameters) {
      const groupKey = parameter.section || '';
      const groupValue = result[groupKey] || [];
      groupValue.push(parameter);

      result[groupKey] = groupValue;
    }

    return Object.entries(result);
  }, [service]);

  const form = useForm<DeploymentUpdate>({ resolver, defaultValues: value || defaultValue });

  useEffect(() => {
    form.reset(value);
  }, [value, form]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit(v))}>
        <div className="flex gap-8">
          <div className="grow">
            <fieldset disabled={isPending}>
              <FormAlert common={texts.theme.updateFailed} error={error} />

              <Forms.Text name="name" label={texts.common.name} maxLength={100} />

              {groupedParameters.map(([label, parameters]) => (
                <section className="mb-4" key={label}>
                  <legend className="legend">{label}</legend>
                  {parameters.map((parameter) => (
                    <DeploymentControl key={parameter.name} parameter={parameter} />
                  ))}
                </section>
              ))}

              <Forms.Row name="submit">
                {onCancel && (
                  <button type="button" className="btn btn-primary w-auto" onClick={onCancel}>
                    {texts.common.cancel}
                  </button>
                )}

                <button type="submit" className="btn btn-primary w-auto">
                  {texts.common.save}
                </button>
              </Forms.Row>
            </fieldset>
          </div>
          <div className="w-100">
            <div className="card card-border bg-base sticky top-4 border-slate-300 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-xl">{texts.deployments.estimatedPrice}</h2>
                <DeploymentSummary service={service} />
                <div className="mt-4 leading-6">{texts.deployments.estimatedPriceText}</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
