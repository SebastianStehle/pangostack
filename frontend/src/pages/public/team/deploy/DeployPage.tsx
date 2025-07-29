import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ServicePublicDto, useClients } from 'src/api';
import { texts } from 'src/texts';
import { DeploymentForm } from './DeploymentForm';

export const DeployPage = () => {
  const { teamId } = useParams();
  const [service, setService] = useState<ServicePublicDto>();

  const clients = useClients();
  const { data: services } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => clients.services.getServicesPublic(),
    refetchOnWindowFocus: false,
  });

  const creating = useMutation({
    mutationFn: (parameters: any) => {
      return clients.deployments.postDeployment(teamId!, { parameters, serviceId: service!.id });
    },
    onSuccess: () => {
      toast(texts.common.saved, { type: 'success' });
    },
  });

  return (
    <div>
      <h2>Deploy</h2>

      {service ? (
        <>
          <DeploymentForm service={service} onSubmit={creating.mutate} isPending={creating.isPending} />
        </>
      ) : services != null ? (
        <>
          {(services?.items || []).map((service) => (
            <div key={service.id} className="card shadow-sm shadow-sm" onClick={() => setService(service)}>
              <div className="card-body">{service.name}</div>
            </div>
          ))}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
