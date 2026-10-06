import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { OrphanedResourceDto, OrphanedResourceDtoStatusEnum, useClients } from 'src/api';
import { Spinner } from 'src/components';
import { toastError } from 'src/components/ToastError';
import { texts } from 'src/texts';

export interface OrphanedResourceStatusButtonsProps {
  orphanedResource: OrphanedResourceDto;

  onStatus: (orphanedResource: OrphanedResourceDto) => void;
}

export const OrphanedResourceStatusButtons = (props: OrphanedResourceStatusButtonsProps) => {
  const { onStatus, orphanedResource } = props;
  const clients = useClients();

  const updating = useMutation({
    mutationFn: (status: OrphanedResourceDtoStatusEnum) => {
      return clients.orphanedResources.postOrphanedResourceStatus(orphanedResource.id, { status });
    },
    onSuccess: (updated) => {
      toast.info(texts.orphanedResources.statusSuccess);
      onStatus(updated);
    },
    onError: (error) => {
      toastError(texts.orphanedResources.statusFailed, error);
    },
  });

  if (orphanedResource.status !== 'Open') {
    return (
      <button className="btn btn-sm" disabled={updating.isPending} onClick={() => updating.mutate('Open')}>
        <Spinner visible={updating.isPending} /> {texts.orphanedResources.reopen}
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button className="btn btn-sm" disabled={updating.isPending} onClick={() => updating.mutate('Ignored')}>
        <Spinner visible={updating.isPending} /> {texts.orphanedResources.ignore}
      </button>

      <button className="btn btn-sm" disabled={updating.isPending} onClick={() => updating.mutate('Deleted')}>
        {texts.orphanedResources.markDeleted}
      </button>
    </div>
  );
};
