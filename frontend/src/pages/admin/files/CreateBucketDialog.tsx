import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { BucketDto, UpsertBucketDto, useApi } from 'src/api';
import { FormAlert, Forms, Modal } from 'src/components';
import { texts } from 'src/texts';
import { TestButton } from './TestButton';

const SCHEME = Yup.object().shape({
  // Required name.
  name: Yup.string().required().label(texts.common.name),

  // Required endpoint.
  endpoint: Yup.string().required().label(texts.common.endpoint),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface CreateBucketDialogProps {
  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when created.
  onCreate: (bucket: BucketDto) => void;
}

export function CreateBucketDialog(props: CreateBucketDialogProps) {
  const { onCreate, onClose } = props;

  const api = useApi();

  const creating = useMutation({
    mutationFn: (request: UpsertBucketDto) => {
      return api.files.postBucket(request);
    },
    onSuccess: (response) => {
      onCreate(response);
      onClose();
    },
  });

  const form = useForm<UpsertBucketDto>({ resolver: RESOLVER, defaultValues: { isDefault: false } });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
        <Modal
          size="sm"
          onClose={onClose}
          header={<div className="flex items-center gap-4">{texts.files.createBucket}</div>}
          footer={
            <fieldset disabled={creating.isPending}>
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
          <fieldset disabled={creating.isPending}>
            <FormAlert common={texts.files.createBucketFailed} error={creating.error} />

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
