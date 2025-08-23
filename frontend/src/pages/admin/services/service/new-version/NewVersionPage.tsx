import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { CreateServiceVersionDto, useClients } from 'src/api';
import { FormAlert, Forms, Icon, TransientNavLink } from 'src/components';
import { useStickyObserver, useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';

const SCHEME = Yup.object({
  // Required name.
  name: Yup.string().label(texts.common.name).required(),

  // Required description.
  definition: Yup.string().label(texts.services.definition).required(),
});

const RESOLVER = yupResolver<any>(SCHEME);

export interface NewServicePageProps {
  // When the version has been created.
  onCreate: () => void;
}

export const NewServicePage = (props: NewServicePageProps) => {
  const { serviceId } = useTypedParams({ serviceId: 'int' });
  const { onCreate } = props;
  const clients = useClients();
  const navigate = useNavigate();
  const { isSticky, sentinelRef } = useStickyObserver();

  const creating = useMutation({
    mutationFn: (request: CreateServiceVersionDto) => {
      request.environment ||= {};
      return clients.services.postServiceVersion(serviceId, request);
    },
    onSuccess: () => {
      onCreate();
      navigate(`../${serviceId}`);
    },
  });

  const form = useForm<CreateServiceVersionDto>({ resolver: RESOLVER, defaultValues: { isActive: true } });

  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-4">
        <TransientNavLink className="btn btn-ghost btn-circle text-sm" to={`../${serviceId}`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h3 className="grow text-xl">{texts.services.createVersion}</h3>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((v) => creating.mutate(v))}>
          <fieldset disabled={creating.isPending}>
            <FormAlert className="sticky top-2 z-10" common={texts.services.createVersionFailed} error={creating.error} />

            <div ref={sentinelRef}>
              <div className="alert alert-info mb-4">
                <Icon icon="info" />
                <span>{texts.services.definitionHint}</span>
              </div>

              <Forms.Text name="name" label={texts.common.name} vertical required />

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
                readOnly={creating.isPending}
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
