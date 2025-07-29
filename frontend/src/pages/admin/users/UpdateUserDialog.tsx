import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { UpsertUserDto, useClients, UserDto, UserGroupDto } from 'src/api';
import { ConfirmDialog, FormAlert, Forms, Modal } from 'src/components';
import { texts } from 'src/texts';
import { GenerateApiKeyButton } from './GenerateApiKeyButton';

const SCHEME = Yup.object({
  // Required name.
  name: Yup.string().label(texts.common.name).required(),

  // Required email.
  email: Yup.string().label(texts.common.email).required().email(),

  // Required user group.
  userGroupId: Yup.string().label(texts.common.userGroup).required(),

  // The password to confirm.
  passwordConfirm: Yup.string()
    .label(texts.common.passwordConfirm)
    .oneOf([Yup.ref('password'), '', undefined], texts.common.passwordsDoNotMatch),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface UpdateUserDialogProps {
  // The extension.
  target: UserDto;

  // The user groups.
  userGroups: UserGroupDto[];

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when updated.
  onUpdate: (user: UserDto) => void;

  // Invoked when deleted.
  onDelete: (id: string) => void;
}

export function UpdateUserDialog(props: UpdateUserDialogProps) {
  const { onClose, onDelete, onUpdate, target, userGroups } = props;

  const clients = useClients();
  const updating = useMutation({
    mutationFn: (request: UpsertUserDto) => {
      return clients.users.putUser(target.id, request);
    },
    onSuccess: (response) => {
      onUpdate(response);
      onClose();
    },
  });

  const deleting = useMutation({
    mutationFn: () => {
      return clients.users.deleteUser(target.id);
    },
    onSuccess: () => {
      onDelete(target.id);
      onClose();
    },
  });

  const userGroupsOptions = useMemo(() => {
    return userGroups.map((g) => ({ label: g.name, value: g.id }));
  }, [userGroups]);

  const form = useForm<UpsertUserDto>({ defaultValues: target, resolver: RESOLVER });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <Modal
          onClose={onClose}
          header={<div className="flex items-center gap-4">{texts.users.update}</div>}
          footer={
            <fieldset disabled={updating.isPending || deleting.isPending}>
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
          <fieldset disabled={updating.isPending || deleting.isPending}>
            <FormAlert common={texts.users.updateFailed} error={updating.error} />

            <Forms.Text name="name" label={texts.common.name} required />

            <Forms.Text name="email" label={texts.common.email} required />

            <Forms.Select name="userGroupId" options={userGroupsOptions} label={texts.common.userGroup} />

            <Forms.Password name="password" label={texts.common.password} />

            <Forms.Password name="passwordConfirm" label={texts.common.passwordConfirm} />

            <Forms.Row name="apiKey" label={texts.common.apiKey}>
              <div className="flex gap-2">
                <div className="grow">
                  <Forms.Text vertical name="apiKey" />
                </div>

                <GenerateApiKeyButton />
              </div>
            </Forms.Row>

            <Forms.Tags name="roles" label={texts.common.roles} />

            <hr className="my-6" />

            <Forms.Row name="danger" label={texts.common.dangerZone}>
              <ConfirmDialog
                title={texts.users.removeConfirmTitle}
                text={texts.users.removeConfirmText}
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
