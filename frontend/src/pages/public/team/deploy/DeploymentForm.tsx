import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { DeploymentDto, ParameterDefinitionDto, ServicePublicDto } from 'src/api';
import { FormAlert, Forms } from 'src/components';
import { useStickyObserver } from 'src/hooks';
import { texts } from 'src/texts';
import { DeploymentControl } from './DeploymentControl';
import { DeploymentSummary } from './DeploymentSummary';
import { useDeploymentResolver } from './hooks';

export interface DeploymentFormProps {
  value?: DeploymentDto;

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

export const DeploymentForm = (props: DeploymentFormProps) => {
  const { error, isPending, onCancel, onSubmit, service, value } = props;
  const { isSticky, sentinelRef } = useStickyObserver();
  const resolver = useDeploymentResolver(service);

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
              <div>
                <FormAlert common={texts.theme.updateFailed} error={error} />

                <Forms.Text name="name" label={texts.common.name} maxLength={100} />

                {groupedParameters.map(([label, parameters]) => (
                  <section className="mb-4" key={label}>
                    <legend className="legend">{label}</legend>
                    {parameters.map((parameter) => (
                      <fieldset className="form-row" disabled={!!value && !!parameter.immutable}>
                        <DeploymentControl key={parameter.name} parameter={parameter} />
                      </fieldset>
                    ))}
                  </section>
                ))}
              </div>

              <div ref={sentinelRef} className="h-px" />

              <div
                className={classNames('sticky right-0 bottom-0 left-0 z-[100] -mx-4 bg-white px-4 py-4', {
                  'border-t-[1px] border-gray-300': isSticky,
                })}
              >
                <Forms.Row name="submit">
                  {onCancel && (
                    <button type="button" className="btn btn-primary w-auto" onClick={onCancel}>
                      {texts.common.cancel}
                    </button>
                  )}

                  <button type="submit" className="btn btn-primary w-auto">
                    {texts.deployments.deployButton}
                  </button>
                </Forms.Row>
              </div>
            </fieldset>
          </div>
          <div className="w-100">
            <div className="card card-border bg-base sticky top-4 border-slate-300">
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
};
