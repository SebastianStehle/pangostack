import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { ServiceDto, UpsertServiceDto, useClients } from 'src/api';
import { FormAlert, Forms, Modal } from 'src/components';
import { texts } from 'src/texts';

const SCHEME = Yup.object({
  // Required name.
  name: Yup.string().label(texts.common.name).required(),

  // Optional description.
  description: Yup.string().label(texts.common.description).required(),

  // Required currency.
  currency: Yup.string().label(texts.common.currency).required(),

  // Required non-negative price.
  pricePerCpuHour: Yup.number().label(texts.services.pricePerCpuHour).required().min(0),

  // Required non-negative price.
  pricePerVolumeGbHour: Yup.number().label(texts.services.pricePerVolumeGbHour).required().min(0),

  // Required non-negative price.
  pricePerMemoryGbHour: Yup.number().label(texts.services.pricePerMemoryGbHour).required().min(0),

  // Required non-negative price.
  pricePerStorageGbMonth: Yup.number().label(texts.services.pricePerStorageGbMonth).required().min(0),

  // Required non-negative price.
  fixedPrice: Yup.number().label(texts.services.fixedPrice).required().min(0),
});

const RESOLVER = yupResolver<any>(SCHEME);

const DEFAULT_VALUE: Partial<ServiceDto> = {
  currency: 'USD',
  fixedPrice: 0,
  isPublic: true,
  pricePerCpuHour: 0,
  pricePerMemoryGbHour: 0,
  pricePerStorageGbMonth: 0,
  pricePerVolumeGbHour: 0,
};

export interface UpsertServiceDialogProps {
  // The service.
  target?: ServiceDto;

  // Invoked when cancelled.
  onClose: () => void;

  // Invoked when created.
  onUpsert: (service: ServiceDto) => void;
}

export function UpsertServiceDialog(props: UpsertServiceDialogProps) {
  const { onClose, onUpsert, target } = props;

  const clients = useClients();
  const upserting = useMutation({
    mutationFn: (request: UpsertServiceDto) => {
      request.environment ||= {};
      if (target) {
        return clients.services.putService(target.id, request);
      } else {
        return clients.services.postService(request);
      }
    },
    onSuccess: (response) => {
      onUpsert(response);
      onClose();
    },
  });

  const form = useForm<UpsertServiceDto>({ resolver: RESOLVER, defaultValues: target || DEFAULT_VALUE });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((v) => upserting.mutate(v))}>
        <Modal
          size="lg"
          onClose={onClose}
          header={<div className="flex items-center gap-4">{target ? texts.services.update : texts.services.create}</div>}
          footer={
            <fieldset disabled={upserting.isPending}>
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
          <fieldset disabled={upserting.isPending}>
            <FormAlert common={target ? texts.services.updateFailed : texts.services.createFailed} error={upserting.error} />

            <Forms.Text name="name" label={texts.common.name} required />

            <Forms.Markdown name="description" label={texts.common.description} required />

            <section>
              <legend className="legend">{texts.services.pricing}</legend>

              <Forms.Text name="currency" label={texts.common.currency} maxLength={3} required />

              <Forms.Number name="pricePerCpuHour" label={texts.services.pricePerCpuHourLabel} required />

              <Forms.Number name="pricePerVolumeGbHour" label={texts.services.pricePerVolumeGbHourLabel} required />

              <Forms.Number name="pricePerMemoryGbHour" label={texts.services.pricePerMemoryGbHourLabel} required />

              <Forms.Number name="pricePerStorageGbMonth" label={texts.services.pricePerStorageGbMonthLabel} required />

              <Forms.Number name="fixedPrice" label={texts.services.fixedPrice} required />
            </section>

            <section>
              <legend className="legend">{texts.common.more}</legend>

              <Forms.Boolean name="isPublic" label={texts.services.isPublic} required />

              <Forms.Code
                height="200px"
                label={texts.common.environment}
                mode="javascript"
                name="environment"
                valueMode="object"
              />
            </section>
          </fieldset>
        </Modal>
      </form>
    </FormProvider>
  );
}
