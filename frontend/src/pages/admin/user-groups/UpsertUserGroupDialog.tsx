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

export interface UpsertUserGroupDialogProps {
  // The user group.
  target?: UserGroupDto;

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when updated.
  onUpsert: (userGroup: UserGroupDto) => void;

  // Invoked when deleted.
  onDelete?: (id: string) => void;
}

export const UpsertUserGroupDialog = (props: UpsertUserGroupDialogProps) => {
  const { onClose, onDelete, onUpsert, target } = props;
  const clients = useClients();

  const updating = useMutation({
    mutationFn: (request: UpsertUserGroupDto) => {
      if (target) {
        return clients.users.putUserGroup(target.id, request);
      } else {
        return clients.users.postUserGroup(request);
      }
    },
    onSuccess: (response) => {
      onUpsert(response);
      onClose();
    },
  });

  const deleting = useMutation({
    mutationFn: () => {
      return clients.users.deleteUserGroup(target!.id);
    },
    onSuccess: () => {
      onDelete?.(target!.id);
      onClose();
    },
  });

  const form = useForm<UpsertUserGroupDto>({ resolver: RESOLVER, defaultValues: target });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <Modal
          onClose={onClose}
          header={<div className="flex items-center gap-4">{target ? texts.userGroups.update : texts.userGroups.create}</div>}
          footer={
            <fieldset disabled={updating.isPending || deleting.isPending || target?.isBuiltIn}>
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
          <fieldset disabled={updating.isPending || deleting.isPending || target?.isBuiltIn}>
            <FormAlert common={target ? texts.userGroups.updateFailed : texts.userGroups.createFailed} error={updating.error} />

            <Forms.Text name="name" label={texts.common.name} required />

            {target && (
              <>
                <hr className="my-6 border-slate-300" />

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
              </>
            )}
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
};
