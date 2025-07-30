import { useMutation, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { UpdateServiceVersionDto, useClients } from 'src/api';
import { FormAlert, Forms, Icon, TransientNavLink } from 'src/components';
import { useStickyObserver } from 'src/hooks';
import { texts } from 'src/texts';

export interface VersionPageProps {
  // When the version has been created.
  onUpdate: () => void;
}

export const VersionPage = (props: VersionPageProps) => {
  const { onUpdate } = props;
  const { serviceId, versionId } = useParams();
  const clients = useClients();
  const navigate = useNavigate();
  const { isSticky, sentinelRef } = useStickyObserver();

  const { data: loadedServiceVersion, isFetched } = useQuery({
    queryKey: ['service-versions', serviceId],
    queryFn: () => clients.services.getServiceVersion(+serviceId!, +versionId!),
  });

  const creating = useMutation({
    mutationFn: (request: UpdateServiceVersionDto) => {
      request.environment ||= {};
      return clients.services.putServiceVersion(+serviceId!, +versionId!, request);
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

  if (!loadedServiceVersion) {
    return <div>{texts.common.notFound}</div>;
  }

  return (
    <div className="relative">
      <div className="flex gap-4 pb-4">
        <TransientNavLink className="btn btn-ghost btn-sm text-sm" to={`../${serviceId}`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h3 className="grow text-xl">
          {texts.services.updateVersion} {loadedServiceVersion.name}
        </h3>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
          <fieldset disabled={creating.isPending}>
            <FormAlert common={texts.services.createVersionFailed} error={creating.error} />

            <div ref={sentinelRef}>
              <Forms.Boolean name="isActive" label={texts.services.isActive} vertical />

              <Forms.Code
                height="200px"
                label={texts.common.environment}
                mode="javascript"
                name="environment"
                valueMode="object"
                vertical
              />
            </div>

            <div
              className={classNames('sticky bottom-0 left-0 right-0 z-[100] -mx-4 mt-4  bg-slate-50 px-4 py-4', {
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
