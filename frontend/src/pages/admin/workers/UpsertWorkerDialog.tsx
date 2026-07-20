import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { UpsertWorkerDto, useClients, WorkerDto } from 'src/api';
import { ConfirmDialog, FormAlert, Forms, Modal } from 'src/components';
import { texts } from 'src/texts';

// Yup.url() requires a TLD and therefore rejects hosts like https://localhost:3100, which is the
// most common worker endpoint. Only the protocol is enforced, like in the backend.
const isEndpoint = (value?: string) => {
  if (!value) {
    return true;
  }

  try {
    const { protocol } = new URL(value);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const SCHEME = Yup.object({
  // Required endpoint.
  endpoint: Yup.string().label(texts.workers.endpoint).required().test('endpoint', texts.workers.endpointInvalid, isEndpoint),

  // Optional API key.
  apiKey: Yup.string().label(texts.workers.apiKey).optional(),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface UpsertWorkerDialogProps {
  // The worker.
  target?: WorkerDto;

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when updated.
  onUpsert: (worker: WorkerDto) => void;

  // Invoked when deleted.
  onDelete?: (id: number) => void;
}

export const UpsertWorkerDialog = (props: UpsertWorkerDialogProps) => {
  const { onClose, onDelete, onUpsert, target } = props;
  const clients = useClients();

  const updating = useMutation({
    mutationFn: (request: UpsertWorkerDto) => {
      // An empty API key is not sent, so that the existing key is kept.
      const values = { ...request, apiKey: request.apiKey || undefined };

      if (target) {
        return clients.workers.putWorker(target.id, values);
      } else {
        return clients.workers.postWorker(values);
      }
    },
    onSuccess: (response) => {
      onUpsert(response);
      onClose();
    },
  });

  const deleting = useMutation({
    mutationFn: () => {
      return clients.workers.deleteWorker(target!.id);
    },
    onSuccess: () => {
      onDelete?.(target!.id);
      onClose();
    },
  });

  const form = useForm<UpsertWorkerDto>({ resolver: RESOLVER, defaultValues: { endpoint: target?.endpoint || '' } });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => updating.mutate(v))}>
        <Modal
          onClose={onClose}
          header={<div className="flex items-center gap-4">{target ? texts.workers.update : texts.workers.create}</div>}
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
            <FormAlert common={target ? texts.workers.updateFailed : texts.workers.createFailed} error={updating.error} />

            <Forms.Url name="endpoint" label={texts.workers.endpoint} hints={texts.workers.endpointHints} required />

            <Forms.Password
              name="apiKey"
              label={texts.workers.apiKey}
              hints={target?.hasApiKey ? texts.workers.apiKeyConfigured : texts.workers.apiKeyHints}
            />

            {target && (
              <>
                <hr className="my-6 border-gray-300" />

                <Forms.Row name="danger" label={texts.common.dangerZone}>
                  <ConfirmDialog
                    title={texts.workers.removeConfirmTitle}
                    text={texts.workers.removeConfirmText}
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
