import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { BucketDto, UpsertBucketDto, useApi } from 'src/api';
import { FormAlert, Forms, Modal } from 'src/components';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';
import { TestButton } from './TestButton';

const SCHEME = Yup.object().shape({
  // Required name.
  name: Yup.string().required().label(texts.common.name),

  // Required endpoint.
  endpoint: Yup.string().required().label(texts.common.endpoint),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface UpdateBucketDialogProps {
  // The bucket to update.
  target: BucketDto;

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when updated.
  onUpdate: (bucket: BucketDto) => void;
}

export function UpdateBucketDialog(props: UpdateBucketDialogProps) {
  const { onClose, onUpdate, target } = props;

  const api = useApi();

  const updating = useMutation({
    mutationFn: (request: UpsertBucketDto) => {
      return api.files.putBucket(target.id, request);
    },
    onSuccess: (response) => {
      onUpdate(response);
      onClose();
    },
    onError: async (error) => {
      toast.error(await buildError(texts.theme.updateFailed, error));
    },
  });

  const form = useForm<UpsertBucketDto>({ resolver: RESOLVER, defaultValues: target });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <Modal
          size="sm"
          onClose={onClose}
          header={<div className="flex items-center gap-4">{texts.files.createBucket}</div>}
          footer={
            <fieldset disabled={updating.isPending}>
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-2">
                  <button type="button" className="btn btn-ghost" onClick={onClose}>
                    {texts.common.cancel}
                  </button>

                  <TestButton />
                </div>

                <button type="submit" className="btn btn-primary">
                  {texts.common.save}
                </button>
              </div>
            </fieldset>
          }
        >
          <fieldset disabled={updating.isPending}>
            <FormAlert common={texts.files.updateBucketFailed} error={updating.error} />

            <Forms.Text vertical name="name" label={texts.common.name} autoFocus required />

            <Forms.Url vertical name="endpoint" label={texts.common.endpoint} required />

            <Forms.Textarea vertical name="headers" label={texts.common.headers} />

            <Forms.Boolean vertical name="isDefault" label={texts.files.isDefault} />
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
}
