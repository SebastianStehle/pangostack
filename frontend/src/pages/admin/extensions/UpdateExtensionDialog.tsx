import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { BucketDto, ExtensionDto, UpdateExtensionDto, useApi } from 'src/api';
import { ConfirmDialog, FormAlert, Forms, Modal } from 'src/components';
import { texts } from 'src/texts';
import { ExtensionForm } from './ExtensionForm';
import { TestButton } from './TestButton';
import { useCleanedExtension, useSpecResolver } from './hooks';
import { ExtensionWithSpec } from './state';

export interface UpdateExtensionDialogProps {
  // The buckets.
  buckets: BucketDto[];

  // The extension.
  target: ExtensionWithSpec;

  // The deployment ID.
  deploymentId: number;

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when updated.
  onUpdate: (extension: ExtensionDto) => void;

  // Invoked when deleted.
  onDelete: (id: number) => void;
}

export function UpdateExtensionDialog(props: UpdateExtensionDialogProps) {
  const { buckets, deploymentId, onClose, onDelete, onUpdate, target } = props;

  const api = useApi();

  const updating = useMutation({
    mutationFn: (request: UpdateExtensionDto) => {
      return api.extensions.putExtension(deploymentId, target.extension.id, request);
    },
    onSuccess: (response) => {
      onUpdate(response);
      onClose();
    },
  });

  const deleting = useMutation({
    mutationFn: () => {
      return api.extensions.deleteExtension(deploymentId, target.extension.id);
    },
    onSuccess: () => {
      onDelete(target.extension.id);
      onClose();
    },
  });

  const defaultValues = useCleanedExtension(target.spec, target.extension);

  const resolver = useSpecResolver(target.spec);
  const form = useForm<UpdateExtensionDto>({ resolver, defaultValues });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <Modal
          onClose={onClose}
          header={
            <div className="flex items-center gap-4">
              {target.spec.logo && (
                <img className="h-6" src={`data:image/svg+xml;utf8,${encodeURIComponent(target.spec.logo)}`} />
              )}

              {texts.extensions.updateExtension}
            </div>
          }
          footer={
            <fieldset disabled={updating.isPending || deleting.isPending}>
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-2">
                  <button type="button" className="btn btn-ghost" onClick={onClose}>
                    {texts.common.cancel}
                  </button>

                  {target.spec.testable && <TestButton />}
                </div>

                <button type="submit" className="btn btn-primary">
                  {texts.common.save}
                </button>
              </div>
            </fieldset>
          }
        >
          <fieldset disabled={updating.isPending || deleting.isPending}>
            <FormAlert common={texts.extensions.updateExtensionFailed} error={updating.error} />

            <ExtensionForm buckets={buckets} spec={target.spec} />

            <hr className="my-6" />

            <Forms.Row name="danger" label={texts.common.dangerZone}>
              <ConfirmDialog
                title={texts.extensions.removeExtensionConfirmText}
                text={texts.extensions.removeExtensionConfirmText}
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
