import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { UpsertTeamDto, useClients } from 'src/api';
import { FormAlert, Forms } from 'src/components';
import { useTransientNavigate } from 'src/hooks';
import { texts } from 'src/texts';

const SCHEME = Yup.object().shape({
  // Required name.
  name: Yup.string().required().label(texts.common.name),
});

const RESOLVER = yupResolver<any>(SCHEME);

export function TeamCreatePage() {
  const navigate = useTransientNavigate();
  const clients = useClients();
  const creating = useMutation({
    mutationFn: (request: UpsertTeamDto) => {
      return clients.teams.postTeam(request);
    },
    onSuccess: (team) => {
      toast(texts.common.saved, { type: 'success' });
      navigate(`/teams/${team.id}`);
    },
  });

  const form = useForm<UpsertTeamDto>({ resolver: RESOLVER });

  return (
    <div className="container mx-auto -mt-10 max-w-[1000px] px-4">
      <div className="card-body rounded-lg bg-white p-8 shadow-xl">
        <h2 className="card-title text-2xl">{texts.teams.createTitle}</h2>
        <p className="mb-4">{texts.teams.createText}</p>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
            <fieldset disabled={creating.isPending}>
              <FormAlert common={texts.theme.updateFailed} error={creating.error} />

              <Forms.Text name="name" label={texts.common.name} vertical />

              <Forms.Row name="submit" vertical>
                <div>
                  <button type="submit" className="btn btn-primary w-auto">
                    {texts.common.save}
                  </button>
                </div>
              </Forms.Row>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
