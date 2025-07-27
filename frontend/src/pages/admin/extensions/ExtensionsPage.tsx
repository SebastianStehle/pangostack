import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BucketDto, ExtensionDto, useApi } from 'src/api';
import { Icon } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';
import { CreateExtensionDialog } from './CreateExtensionDialog';
import { ExtensionCard } from './ExtensionCard';
import { UpdateExtensionDialog } from './UpdateExtensionDialog';
import { ExtensionWithSpec, useExtensionsStore } from './state';

const EMPTY_BUCKETS: BucketDto[] = [];

export function ExtensionsPage() {
  const api = useApi();

  const deploymentParam = useParams<'id'>();
  const deploymentId = +deploymentParam.id!;
  const [toCreate, setToCreate] = useState<boolean>();
  const [toUpdate, setToUpdate] = useState<ExtensionWithSpec | null>();
  const { extensions, specs, removeExtension, setExtension, setExtensions } = useExtensionsStore();

  const { data: loadedBuckets } = useQuery({
    queryKey: ['buckets'],
    queryFn: () => api.files.getBuckets(),
  });

  const { data: loadedExtensions, isFetched } = useQuery({
    queryKey: ['extensions', deploymentId],
    queryFn: () => api.extensions.getExtensions(deploymentId),
  });

  useEffect(() => {
    if (loadedExtensions) {
      setExtensions(loadedExtensions.configured, loadedExtensions.specs);
    }
  }, [loadedExtensions, setExtensions]);

  const deleting = useMutation({
    mutationFn: (extension: ExtensionDto) => {
      return api.extensions.deleteExtension(deploymentId, extension.id);
    },
    onSuccess: (_, extension) => {
      removeExtension(extension.id);
    },
    onError: async (error) => {
      toast.error(await buildError(texts.extensions.removeExtensionFailed, error));
    },
  });

  const doClose = useEventCallback(() => {
    setToUpdate(null);
    setToCreate(false);
  });

  const buckets = loadedBuckets?.items || EMPTY_BUCKETS;
  const asTools = extensions.filter((e) => e.spec.type === 'tool');
  const asOthers = extensions.filter((e) => e.spec.type === 'other');
  const asModels = extensions.filter((e) => e.spec.type === 'llm');
  const numModels = asModels.filter((e) => e.extension.enabled).length;

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex">
          <h2 className="grow text-2xl">{texts.extensions.headline}</h2>

          <button className="btn btn-success btn-sm text-sm text-white" onClick={() => setToCreate(true)}>
            <Icon icon="plus" size={16} /> {texts.extensions.add}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xl">{texts.extensions.typeModels}</h3>

          {numModels === 0 && isFetched && (
            <div role="alert" className="alert alert-error">
              <Icon icon="alert" />
              <span>{texts.extensions.warningNoModel}</span>
            </div>
          )}

          {numModels > 1 && isFetched && (
            <div role="alert" className="alert alert-warning">
              <Icon icon="alert" />
              <span>{texts.extensions.warningTooManyModels}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {asModels.map((extension) => (
              <ExtensionCard
                key={extension.extension.id}
                buckets={buckets}
                extension={extension.extension}
                onClick={(spec, extension) => setToUpdate({ spec, extension })}
                onDelete={deleting.mutate}
                spec={extension.spec}
              />
            ))}
          </div>
        </div>

        {asOthers.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl">{texts.extensions.typeOther}</h3>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {asOthers.map((extension) => (
                <ExtensionCard
                  key={extension.extension.id}
                  buckets={buckets}
                  extension={extension.extension}
                  onClick={(spec, extension) => setToUpdate({ spec, extension })}
                  onDelete={deleting.mutate}
                  spec={extension.spec}
                />
              ))}
            </div>
          </div>
        )}

        {asTools.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl">{texts.extensions.typeTools}</h3>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {asTools.map((extension) => (
                <ExtensionCard
                  key={extension.extension.id}
                  buckets={buckets}
                  extension={extension.extension}
                  onClick={(spec, extension) => setToUpdate({ spec, extension })}
                  onDelete={deleting.mutate}
                  spec={extension.spec}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {toCreate && (
        <CreateExtensionDialog
          buckets={buckets}
          deploymentId={deploymentId}
          onClose={doClose}
          onCreate={setExtension}
          specs={specs}
        />
      )}

      {toUpdate && (
        <UpdateExtensionDialog
          buckets={buckets}
          deploymentId={deploymentId}
          onClose={doClose}
          onDelete={removeExtension}
          onUpdate={setExtension}
          target={toUpdate}
        />
      )}
    </>
  );
}
