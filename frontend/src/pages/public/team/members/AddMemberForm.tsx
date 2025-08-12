import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { TeamUserDto, UpsertTeamUserDto, useClients } from 'src/api';
import { Forms } from 'src/components';
import { texts } from 'src/texts';

const SCHEME = Yup.object({
  // Required email.
  userIdOrEmail: Yup.string().label(texts.common.email).required().email(),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface AddMemberFormProps {
  // The ID of the team.
  teamId: number;

  // Invoked when created.
  onCreate: (user: TeamUserDto) => void;
}

export function AddMemberForm(props: AddMemberFormProps) {
  const { onCreate, teamId } = props;
  const clients = useClients();

  const form = useForm<UpsertTeamUserDto>({ resolver: RESOLVER });

  const creating = useMutation({
    mutationFn: (request: UpsertTeamUserDto) => {
      return clients.teams.postTeamUser(teamId, request);
    },
    onSuccess: (response, request) => {
      const user = response.users.find((x) => x.user.email === request.userIdOrEmail)!;

      onCreate(user);
      form.reset();
    },
    onError: () => {
      toast.error(texts.members.addMemberFailed);
    },
  });

  return (
    <FormProvider {...form}>
      <form autoComplete="off" onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
        <fieldset disabled={creating.isPending}>
          <div className="flex gap-4">
            <div className="grow">
              <Forms.Text vertical name="userIdOrEmail" placeholder={texts.common.email} autoComplete="off" required />
            </div>

            <button type="submit" className="btn btn-primary">
              {texts.members.addMemberButton}
            </button>
          </div>
        </fieldset>
      </form>
    </FormProvider>
  );
}
