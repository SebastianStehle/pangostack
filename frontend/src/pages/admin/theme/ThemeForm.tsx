import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { SettingsDto, useClients } from 'src/api';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormAlert, Forms, Links } from 'src/components';
import { useTheme } from 'src/hooks';
import { texts } from 'src/texts';
import { LINKS_SCHEME } from 'src/components/LinksScheme';

const SCHEME = Yup.object().shape({
  // Optional footer links.
  links: LINKS_SCHEME,
});

const RESOLVER = yupResolver<any>(SCHEME);

export function ThemeForm() {
  const clients = useClients();
  const { data: settings } = useQuery({
    queryKey: ['editable-theme'],
    queryFn: () => clients.settings.getSettings(),
  });

  const updating = useMutation({
    mutationFn: (request: SettingsDto) => {
      return clients.settings.postSettings(request);
    },
    onSuccess: () => {
      toast(texts.common.saved, { type: 'success' });
    },
  });

  const form = useForm<SettingsDto>({ resolver: RESOLVER, defaultValues: settings });

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
          <Forms.Color name="headerColor" className="w-auto" label={texts.theme.headerColor} />

          <Forms.Textarea name="customCss" label={texts.theme.customCss} />

          <div className="h-4" />

          <Forms.Text name="footerText" label={texts.theme.footerText} />

          <Forms.Row name="footerLinks" label={texts.theme.footerLinks}>
            <Links name="footerLinks" />
          </Forms.Row>

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
