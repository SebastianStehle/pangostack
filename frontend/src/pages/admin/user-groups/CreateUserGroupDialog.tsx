import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { UpsertUserGroupDto, useApi, UserGroupDto } from 'src/api';
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

  const api = useApi();

  const updating = useMutation({
    mutationFn: (request: UpsertUserGroupDto) => {
      return api.users.postUserGroup(request);
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

            <Forms.Number name="monthlyTokens" label={texts.common.monthlyTokens} />

            <Forms.Number name="monthlyUserTokens" label={texts.common.monthlyUserTokens} />

            <Forms.Boolean name="hideFileUpload" label={texts.common.hideFileUpload} />
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
}
