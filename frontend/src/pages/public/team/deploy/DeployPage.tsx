import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ServicePublicDto, useClients } from 'src/api';
import { Icon, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { DeploymentForm, DeploymentUpdate } from './DeploymentForm';

export const DeployPage = () => {
  const { teamId } = useTypedParams({ teamId: 'int' });
  const [service, setService] = useState<ServicePublicDto>();
  const clients = useClients();
  const navigate = useNavigate();

  const { data: loadedServices } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => clients.services.getServicesPublic(),
  });

  const creating = useMutation({
    mutationFn: ({ name, parameters }: DeploymentUpdate) => {
      return clients.deployments.postDeployment(+teamId!, {
        name,
        parameters,
        serviceId: service!.id,
        confirmUrl: '/deployments',
        cancelUrl: '/deployments',
      });
    },
    onSuccess: (result) => {
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        navigate(`/teams/${teamId}/deployments/${result.deployment!.id}`);
        toast(texts.common.saved, { type: 'success' });
      }
    },
  });

  return (
    <div>
      <div className="mb-8 flex h-10 items-center gap-4">
        <TransientNavLink className="btn btn-ghost btn-circle text-sm" to={`../${teamId}`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h2 className="grow text-2xl">{texts.deployments.deployHeadline}</h2>
      </div>

      {service ? (
        <>
          <DeploymentForm service={service} onSubmit={creating.mutate} isPending={creating.isPending} />
        </>
      ) : loadedServices != null ? (
        <>
          <p className="text-mdx mb-2">{texts.deployments.selectService}</p>

          <div className="flex flex-col gap-2">
            {(loadedServices?.items || []).map((service) => (
              <div
                key={service.id}
                className="card card-border bg-base pointer border-slate-200 shadow-sm"
                onClick={() => setService(service)}
              >
                <div className="card-body">
                  <h2 className="card-title">
                    <div className="badge badge-primary badge-sm me-1 rounded-full font-normal">{service.version}</div>
                    {service.name}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
