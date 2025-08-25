import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ServiceDto, useClients } from 'src/api';
import { Icon, Image, Markdown, toastError } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { texts } from 'src/texts';
import { UpsertServiceDialog } from '../UpsertServiceDialog';

export interface ServiceSummaryProps {
  // The service.
  service: ServiceDto;

  // When the service has been updated.
  onEdit: () => void;
}

export const ServiceSummary = (props: ServiceSummaryProps) => {
  const { onEdit, service } = props;
  const clients = useClients();
  const fileInput = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState(0);
  const [toUpdate, setToUpdate] = useState<ServiceDto | null>(null);

  const uploading = useMutation({
    mutationFn: (request?: File) => {
      return clients.settings.postFile(`service_${service.id}`, request);
    },
    onSuccess: () => {
      toast.success(texts.theme.fileUploadSucceeded);
      setVersion((v) => v + 1);
    },
    onError: async (error) => {
      toastError(texts.theme.fileUploadFailed, error);
    },
  });

  const deleting = useMutation({
    mutationFn: () => {
      return clients.settings.deleteFile(`service_${service.id}`);
    },
    onSuccess: () => {
      setVersion((v) => v + 1);
    },
  });

  const doEdit = useEventCallback(() => {
    setToUpdate(service);
  });

  const doClose = useEventCallback(() => {
    setToUpdate(null);
  });

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center gap-8">
          <div>
            <Image
              size="80px"
              baseUrl={clients.url}
              fileId={`service_${service.id}`}
              version={version}
              fallback="/logo-square.svg"
            />

            <div className="flex gap-2">
              <button className="btn btn-sm btn-primary btn-circle" onClick={() => fileInput.current?.click()}>
                <Icon size={12} icon="edit" />
              </button>

              <input
                ref={fileInput}
                type="file"
                className="hidden"
                onChange={(event) => uploading.mutate(event.target.files?.[0])}
              />

              <button className="btn btn-sm btn-error btn-circle" onClick={() => deleting.mutate()}>
                <Icon size={12} icon="edit" />
              </button>
            </div>
          </div>

          <div className="grow">
            <h2 className="text-2xl">{service.name}</h2>

            <Markdown>{service.description}</Markdown>
          </div>

          <button className="btn btn-outline" onClick={doEdit}>
            {texts.common.edit}
          </button>
        </div>

        {toUpdate && <UpsertServiceDialog onClose={doClose} onUpsert={onEdit} target={toUpdate} />}
      </div>
    </div>
  );
};
