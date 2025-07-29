import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { UpsertUserGroupDto, useClients, UserGroupDto } from 'src/api';
import { FormAlert, Forms, Modal } from 'src/components';
import { texts } from 'src/texts';

const SCHEME = Yup.object({
  // Required name.
  name: Yup.string().label(texts.common.name).required(),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface CreateUserGroupDialogProps {
  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when created.
  onCreate: (user: UserGroupDto) => void;
}

export function CreateUserGroupDialog(props: CreateUserGroupDialogProps) {
  const { onClose, onCreate } = props;

  const clients = useClients();
  const updating = useMutation({
    mutationFn: (request: UpsertUserGroupDto) => {
      return clients.users.postUserGroup(request);
    },
    onSuccess: (response) => {
      onCreate(response);
      onClose();
    },
  });

  const form = useForm<UpsertUserGroupDto>({ resolver: RESOLVER });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <Modal
          onClose={onClose}
          header={<div className="flex items-center gap-4">{texts.userGroups.create}</div>}
          footer={
            <fieldset disabled={updating.isPending}>
              <div className="flex flex-row justify-between">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  {texts.common.cancel}
                </button>

                <button type="submit" className="btn btn-primary">
                  {texts.common.save}
                </button>
              </div>
            </fieldset>
          }
        >
          <fieldset disabled={updating.isPending}>
            <FormAlert common={texts.userGroups.updateFailed} error={updating.error} />

            <Forms.Text name="name" label={texts.common.name} required />
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
}
