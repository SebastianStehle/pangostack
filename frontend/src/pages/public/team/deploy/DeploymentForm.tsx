import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { ObjectShape } from 'yup';
import { ServicePublicDto } from 'src/api';
import { FormAlert, Forms, Links } from 'src/components';
import { isNumber } from 'src/lib';
import { texts } from 'src/texts';

interface ThemeFormProps {
  value: Record<string, any>;

  // The service.
  service: ServicePublicDto;

  // The error.
  error?: Error;

  // Indicates if the form is running.
  isPending?: boolean;

  // When the form is submitted.
  onSubmit: (value: Record<string, any>) => void;

  // When the form is cancelled.
  onCancel?: () => void;
}

export function DeploymentForm(props: ThemeFormProps) {
  const { error, isPending, onCancel, onSubmit, service, value } = props;

  const resolver = useMemo(() => {
    const shape: ObjectShape = {};

    for (const parameter of service.parameters) {
      if (parameter.type === 'boolean') {
        let boolean = Yup.bool();

        if (parameter.required) {
          boolean = boolean.required();
        }

        shape[parameter.name] = boolean;
      } else if (parameter.type === 'number') {
        let number = Yup.number();

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
        let string = Yup.string();

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

    return yupResolver(Yup.object().shape(shape));
  }, [service]);

  const form = useForm<Record<string, any>>({ resolver, defaultValues: value });

  useEffect(() => {
    form.reset(value);
  }, [value, form]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => onSubmit(v))}>
        <fieldset disabled={isPending}>
          <FormAlert common={texts.theme.updateFailed} error={error} />

          <Forms.Text name="name" label={texts.theme.appName} hints={texts.theme.appNameHints} />
          <Forms.Text name="welcomeText" label={texts.theme.welcomeText} hints={texts.theme.welcomeTextHints} />

          <div className="h-4" />

          <Forms.Color name="primaryColor" className="w-auto" label={texts.theme.primaryColor} />
          <Forms.Color name="primaryContentColor" className="w-auto" label={texts.theme.primaryContentColor} />
          <Forms.Color name="headerColor" className="w-auto" label={texts.theme.headerColor} />
          <Forms.Textarea name="customCss" label={texts.theme.customCss} />

          <div className="h-4" />

          <Forms.Text name="footerText" label={texts.theme.footerText} />

          <Forms.Row name="footerLinks" label={texts.theme.footerLinks}>
            <Links name="footerLinks" />
          </Forms.Row>

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
      </form>
    </FormProvider>
  );
}
