import { useMutation } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { UpdateServiceVersionDto, useClients } from 'src/api';
import { Spinner } from 'src/components';
import { toastError } from 'src/components/ToastError';
import { texts } from 'src/texts';

export interface VerifyButtonProps {
  serviceId: number;
}

export const VerifyButton = (props: VerifyButtonProps) => {
  const { serviceId } = props;
  const { getValues } = useFormContext<UpdateServiceVersionDto>();
  const clients = useClients();

  const verifying = useMutation({
    mutationFn: () => {
      const request = getValues();
      request.environment ||= {};
      return clients.services.postVerifyServiceVersion(serviceId, request);
    },
    onSuccess: () => {
      toast.info(texts.services.verifySuccess);
    },
    onError: (error) => {
      toastError(texts.services.verifyFailed, error);
    },
  });

  return (
    <button className="btn btn-secondary" disabled={verifying.isPending} onClick={() => verifying.mutate()}>
      <Spinner visible={verifying.isPending} /> {texts.services.verify}
    </button>
  );
};
