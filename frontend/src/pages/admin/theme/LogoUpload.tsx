import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useClients } from 'src/api';
import { Alert, Forms, Logo } from 'src/components';
import { useTheme } from 'src/hooks';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';

export function LogoUpload() {
  const clients = useClients();
  const { refetch, setTheme } = useTheme();
  const [logo, setLogo] = useState<File | undefined>(undefined);

  const updating = useMutation({
    mutationFn: (request: File) => {
      return clients.settings.postLogo(request);
    },
    onSuccess: () => {
      refetch();
    },
    onError: async (error) => {
      toast.error(await buildError(texts.theme.logoUpdateFailed, error));
    },
  });

  useEffect(() => {
    setTheme({ logo });

    return () => {
      setTheme({ logo: undefined });
    };
  }, [logo, setTheme]);

  const upload = () => {
    if (logo) {
      updating.mutate(logo);
    }
  };

  return (
    <>
      {updating.isError && <Alert text={texts.common.error} className="mb-4" />}

      <div className="flex flex-row items-center gap-8">
        <div className="relative">
          <Logo size="6rem" baseUrl={clients.url} file={logo} />
        </div>

        <div className="divider divider-horizontal"></div>

        <div>
          <div className="flex flex-row gap-2">
            <input
              type="file"
              className="file-input file-input-bordered w-full max-w-xs"
              onChange={(event) => setLogo(event.target.files?.[0])}
            />

            <button type="submit" className="btn btn-primary w-auto" disabled={!logo} onClick={upload || updating.isPending}>
              {texts.common.save}
            </button>
          </div>

          <Forms.Hints className="mt-2" hints={texts.theme.logoHint} />
        </div>
      </div>
    </>
  );
}
