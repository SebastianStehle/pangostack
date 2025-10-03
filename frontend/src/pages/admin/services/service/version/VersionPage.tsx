import { useMutation, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { UpdateServiceVersionDto, useClients } from 'src/api';
import { AdminHeader, FormAlert, Forms, Icon } from 'src/components';
import { useStickyObserver, useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { VerifyServiceVersionButton } from '../VerifyServiceVersionButton';

export interface VersionPageProps {
  // When the version has been created.
  onUpdate: () => void;
}

export const VersionPage = (props: VersionPageProps) => {
  const { onUpdate } = props;
  const { serviceId, versionId } = useTypedParams({ serviceId: 'int', versionId: 'int' });
  const clients = useClients();
  const { isSticky, sentinelRef } = useStickyObserver();

  const { data: loadedService } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => clients.services.getService(serviceId),
  });

  const { data: loadedServiceVersion, isFetched } = useQuery({
    queryKey: ['service-version', serviceId],
    queryFn: () => clients.services.getServiceVersion(serviceId, versionId),
  });

  const creating = useMutation({
    mutationFn: (request: UpdateServiceVersionDto) => {
      request.environment ||= {};
      return clients.services.putServiceVersion(serviceId, versionId, request);
    },
    onSuccess: () => {
      onUpdate();
      toast.success(texts.services.updateVersionSucceeded);
    },
  });

  const form = useForm<UpdateServiceVersionDto>({ defaultValues: {} });

  useEffect(() => {
    if (loadedServiceVersion) {
      form.reset(loadedServiceVersion);
    }
  }, [form, loadedServiceVersion]);

  if (!isFetched) {
    return null;
  }

  if (!loadedServiceVersion || !loadedService) {
    return <div>{texts.common.notFound}</div>;
  }

  return (
    <div className="relative">
      <FormProvider {...form}>
        <AdminHeader title={`${texts.services.updateVersion} ${loadedServiceVersion.name}`} backLink={`../${serviceId}`}>
          <VerifyServiceVersionButton serviceId={serviceId} />
        </AdminHeader>

        <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
          <fieldset disabled={creating.isPending}>
            <FormAlert className="sticky top-2 z-10" common={texts.services.createVersionFailed} error={creating.error} />

            <div>
              {loadedService.isPublic && (
                <div className="alert alert-info mb-4">
                  <Icon icon="info" />
                  <span>{texts.services.definitionUpdateHint}</span>
                </div>
              )}

              <Forms.Boolean name="isActive" label={texts.services.isActive} vertical />

              <Forms.Code
                disabled={creating.isPending}
                height="1000px"
                label={texts.services.definition}
                mode="yaml"
                name="definition"
                noWrap
                required
                valueMode="string"
                vertical
              />

              <Forms.Code
                disabled={creating.isPending}
                height="200px"
                label={texts.common.environment}
                mode="javascript"
                name="environment"
                noWrap
                required={false}
                valueMode="object"
                vertical
              />
            </div>

            <div ref={sentinelRef} className="h-px" />

            <div
              className={classNames('sticky right-0 bottom-0 left-0 z-[100] -mx-4 mt-4 bg-slate-50 px-4 py-4', {
                'border-t-[1px] border-gray-300': isSticky,
              })}
            >
              <button type="submit" className="btn btn-primary">
                {texts.common.save}
              </button>
            </div>
          </fieldset>
        </form>
      </FormProvider>
    </div>
  );
};
