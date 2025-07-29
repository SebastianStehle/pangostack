import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { UpsertUserGroupDto, useClients, UserGroupDto } from 'src/api';
import { ConfirmDialog, FormAlert, Forms, Modal } from 'src/components';
import { texts } from 'src/texts';

const SCHEME = Yup.object({
  // Required name.
  name: Yup.string().label(texts.common.name).required(),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface UpdateUserGroupDialogProps {
  // The extension.
  target: UserGroupDto;

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when updated.
  onUpdate: (userGroup: UserGroupDto) => void;

  // Invoked when deleted.
  onDelete: (id: string) => void;
}

export function UpdateUserGroupDialog(props: UpdateUserGroupDialogProps) {
  const { onClose, onDelete, onUpdate, target } = props;

  const clients = useClients();
  const updating = useMutation({
    mutationFn: (request: UpsertUserGroupDto) => {
      return clients.users.putUserGroup(target.id, request);
    },
    onSuccess: (response) => {
      onUpdate(response);
      onClose();
    },
  });

  const deleting = useMutation({
    mutationFn: () => {
      return clients.users.deleteUserGroup(target.id);
    },
    onSuccess: () => {
      onDelete(target.id);
      onClose();
    },
  });

  const form = useForm<UpsertUserGroupDto>({ resolver: RESOLVER, defaultValues: target });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <Modal
          onClose={onClose}
          header={<div className="flex items-center gap-4">{texts.userGroups.update}</div>}
          footer={
            <fieldset disabled={updating.isPending || deleting.isPending || target.isBuiltIn}>
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
          <fieldset disabled={updating.isPending || deleting.isPending || target.isBuiltIn}>
            <FormAlert common={texts.userGroups.updateFailed} error={updating.error} />

            <Forms.Text name="name" label={texts.common.name} required />

            <hr className="my-6" />

            <Forms.Row name="danger" label={texts.common.dangerZone}>
              <ConfirmDialog
                title={texts.userGroups.removeConfirmTitle}
                text={texts.userGroups.removeConfirmText}
                onPerform={deleting.mutate}
              >
                {({ onClick }) => (
                  <button type="button" className="btn btn-error" onClick={onClick}>
                    {texts.common.remove}
                  </button>
                )}
              </ConfirmDialog>
            </Forms.Row>
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
}
