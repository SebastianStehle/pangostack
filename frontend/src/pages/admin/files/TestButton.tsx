import { useMutation } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { UpsertBucketDto, useApi } from 'src/api';
import { Spinner } from 'src/components';
import { buildError } from 'src/lib';
import { texts } from 'src/texts';

export function TestButton() {
  const api = useApi();

  const form = useFormContext<UpsertBucketDto>();
  const testing = useMutation({
    mutationFn: () => {
      const values = form.getValues();

      return api.files.testBucket(values);
    },
    onSuccess: () => {
      toast.success(texts.files.testSuccess);
    },
    onError: async (error) => {
      toast.error(await buildError(texts.files.testFailed, error));
    },
  });

  const isDisabled = !form.formState.isValid || testing.isPending;

  return (
    <span className="flex flex-row items-center gap-1">
      <button
        type="button"
        className="btn btn-ghost"
        data-tooltip-id="default"
        data-tooltip-content={texts.files.testTooltip}
        disabled={isDisabled}
        onClick={() => testing.mutate()}
      >
        {texts.extensions.test}
      </button>

      <Spinner visible={testing.isPending} />
    </span>
  );
}
