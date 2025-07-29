import { useMutation, useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { LoginDto, useClients } from 'src/api';
import { Forms, Logo } from 'src/components';
import { useLoginUrl, useTheme, useTransientNavigate } from 'src/hooks';
import { texts } from 'src/texts';

export function LoginPage() {
  const clients = useClients();
  const { theme } = useTheme();
  const { data: authSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => clients.auth.getAuthSettings(),
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="no-shrink flex w-full max-w-[800px] grow-0 overflow-y-auto bg-base-100 px-4 pt-24 lg:px-24">
        <div className="mx-auto lg:w-96">
          <div className="mb-[4rem] flex items-center gap-4 text-4xl">
            <Logo size="3rem" baseUrl={clients.url} file={theme.logo} />

            <span className="min-w-0 truncate">{theme.name}</span>
          </div>

          <h2 className="text-slate-500">{theme.welcomeText || texts.login.welcome}</h2>
          <h1 className="mb-12 mt-2 text-4xl">{texts.login.loginHint}</h1>

          <div>
            {!!authSettings?.providers?.length && (
              <div className="flex flex-col gap-4">
                {authSettings?.providers.map((p) => (
                  <LoginButton key={p.name} name={p.name} label={p.displayName} color={p.color} />
                ))}
              </div>
            )}

            <div className="divider my-12 first:hidden last:hidden">OR</div>

            {authSettings?.enablePasswordAuth && <LoginForm />}
          </div>

          <div className="h-24"></div>
        </div>
      </div>
      <div className="hidden h-screen grow items-center justify-center overflow-hidden bg-slate-100 p-8 lg:flex">
        <img className="max-w-full" src="chat.svg" />
      </div>
    </div>
  );
}

function LoginForm() {
  const clients = useClients();
  const navigate = useTransientNavigate();
  const login = useMutation({
    mutationFn: (request: LoginDto) => {
      return clients.auth.login(request);
    },
    onSuccess: () => {
      navigate('/teams');
    },
  });

  const form = useForm<LoginDto>({});

  return (
    <FormProvider {...form}>
      <h4 className="mb-4">{texts.common.loginText}</h4>

      <form onSubmit={form.handleSubmit((v) => login.mutate(v))}>
        {login.isError && <div className="alert alert-error mb-4">{texts.common.loginFailed}</div>}

        <Forms.Text vertical name="email" placeholder={texts.common.email} autoFocus />

        <Forms.Password vertical name="password" placeholder={texts.common.password} />

        <button type="submit" className="btn btn-primary btn-block">
          {texts.common.loginButton}
        </button>
      </form>
    </FormProvider>
  );
}

function LoginButton({ label, color, name }: { label: string; name: string; color: string }) {
  const url = useLoginUrl(name);

  return (
    <a style={{ backgroundColor: color }} className={`btn w-full text-white hover:opacity-90`} href={url}>
      {texts.login.loginButton(label)}
    </a>
  );
}
