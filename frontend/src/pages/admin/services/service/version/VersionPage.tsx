import { useMutation, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { UpdateServiceVersionDto, useClients } from 'src/api';
import { AdminHeader, FormAlert, Forms } from 'src/components';
import { useStickyObserver, useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { VerifyButton } from './VerifyButton';

export interface VersionPageProps {
  // When the version has been created.
  onUpdate: () => void;
}

export const VersionPage = (props: VersionPageProps) => {
  const { onUpdate } = props;
  const { serviceId, versionId } = useTypedParams({ serviceId: 'int', versionId: 'int' });
  const clients = useClients();
  const navigate = useNavigate();
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
      navigate(`../${serviceId}`);
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
          <VerifyButton serviceId={serviceId} />
        </AdminHeader>

        <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
          <fieldset disabled={creating.isPending}>
            <FormAlert className="sticky top-2 z-10" common={texts.services.createVersionFailed} error={creating.error} />

            <div ref={sentinelRef}>
              <Forms.Boolean name="isActive" label={texts.services.isActive} vertical />

              <Forms.Code
                height="1000px"
                label={texts.services.definition}
                mode="yaml"
                name="definition"
                noWrap
                required
                readOnly={creating.isPending}
                valueMode="string"
                vertical
              />

              <Forms.Code
                height="200px"
                label={texts.common.environment}
                mode="javascript"
                name="environment"
                noWrap
                required={false}
                readOnly={creating.isPending || loadedService.isPublic}
                valueMode="object"
                vertical
              />
            </div>

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
