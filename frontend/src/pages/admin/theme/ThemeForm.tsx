import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { SettingsDto, useApi } from 'src/api';
import { FormAlert, Forms } from 'src/components';
import { useTheme } from 'src/hooks';
import { texts } from 'src/texts';

export function ThemeForm() {
  const api = useApi();

  const { data: settings } = useQuery({
    queryKey: ['editable-theme'],
    queryFn: () => api.settings.getSettings(),
  });

  const updating = useMutation({
    mutationFn: (request: SettingsDto) => {
      return api.settings.postSettings(request);
    },
    onSuccess: () => {
      toast(texts.common.saved, { type: 'success' });
    },
  });

  const form = useForm<SettingsDto>({ defaultValues: settings });

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <fieldset disabled={updating.isPending}>
          <FormAlert common={texts.theme.updateFailed} error={updating.error} />

          <Forms.Text name="name" label={texts.theme.appName} hints={texts.theme.appNameHints} />

          <Forms.Text name="welcomeText" label={texts.theme.welcomeText} hints={texts.theme.welcomeTextHints} />

          <div className="h-4" />

          <Forms.Color name="primaryColor" className="w-auto" label={texts.theme.primaryColor} />

          <Forms.Color name="primaryContentColor" className="w-auto" label={texts.theme.primaryContentColor} />

          <Forms.Textarea name="customCss" label={texts.theme.customCss} />

          <Forms.Row name="submit">
            <button type="submit" className="btn btn-primary w-auto">
              {texts.common.save}
            </button>
          </Forms.Row>

          <FormSync />
        </fieldset>
      </form>
    </FormProvider>
  );
}

function FormSync() {
  const formValue = useWatch<SettingsDto>();
  const { setTheme } = useTheme();

  const { name, primaryColor, primaryContentColor } = formValue;

  useEffect(() => {
    setTheme({ name, primaryColor, primaryContentColor });

    return () => {
      setTheme({});
    };
  }, [setTheme, name, primaryColor, primaryContentColor]);

  return null;
}
