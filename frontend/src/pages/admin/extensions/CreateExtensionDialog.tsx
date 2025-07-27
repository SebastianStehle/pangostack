import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { BucketDto, CreateExtensionDto, ExtensionDto, ExtensionSpecDto, useApi } from 'src/api';
import { FormAlert, Modal } from 'src/components';
import { texts } from 'src/texts';
import { ExtensionCard } from './ExtensionCard';
import { ExtensionForm } from './ExtensionForm';
import { TestButton } from './TestButton';
import { useSpecResolver } from './hooks';

export interface CreateExtensionDialogProps {
  // The buckets.
  buckets: BucketDto[];

  // The extension specs.
  specs: ExtensionSpecDto[];

  // The deployment ID.
  deploymentId: number;

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when created.
  onCreate: (extension: ExtensionDto) => void;
}

export function CreateExtensionDialog(props: CreateExtensionDialogProps) {
  const { buckets, deploymentId, onCreate, onClose, specs } = props;

  const api = useApi();
  const [spec, setSpec] = useState<ExtensionSpecDto>();

  const creating = useMutation({
    mutationFn: (request: CreateExtensionDto) => {
      return api.extensions.postExtension(deploymentId, { ...request, name: spec!.name });
    },
    onSuccess: (response) => {
      onCreate(response);
      onClose();
    },
  });

  const resolver = useSpecResolver(spec);
  const form = useForm<CreateExtensionDto>({ resolver, defaultValues: { enabled: true, values: {} } });

  const asTools = specs.filter((x) => x.type === 'tool');
  const asOthers = specs.filter((x) => x.type === 'other');
  const asModels = specs.filter((x) => x.type === 'llm');

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
        <Modal
          gray={!spec}
          onClose={onClose}
          header={
            <div className="flex items-center gap-4">
              {spec?.logo && <img className="h-6" src={`data:image/svg+xml;utf8,${encodeURIComponent(spec.logo)}`} />}

              {texts.extensions.createExtension}
            </div>
          }
          footer={
            spec ? (
              <fieldset disabled={creating.isPending}>
                <div className="flex flex-row justify-between">
                  <div className="flex flex-row gap-4">
                    <button type="button" className="btn btn-ghost" onClick={onClose}>
                      {texts.common.cancel}
                    </button>

                    {spec.testable && <TestButton />}
                  </div>

                  <button type="submit" className="btn btn-primary">
                    {texts.common.save}
                  </button>
                </div>
              </fieldset>
            ) : undefined
          }
        >
          <fieldset disabled={creating.isPending}>
            <FormAlert common={texts.extensions.createExtensionFailed} error={creating.error} />

            {spec ? (
              <ExtensionForm buckets={buckets} spec={spec} />
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="mb-2 text-lg">{texts.extensions.typeModels}</h3>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {asModels.map((spec) => (
                      <ExtensionCard key={spec.name} buckets={buckets} spec={spec} onClick={setSpec} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg">{texts.extensions.typeOther}</h3>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {asOthers.map((spec) => (
                      <ExtensionCard key={spec.name} buckets={buckets} spec={spec} onClick={setSpec} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg">{texts.extensions.typeTools}</h3>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {asTools.map((spec) => (
                      <ExtensionCard key={spec.name} buckets={buckets} spec={spec} onClick={setSpec} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
}
