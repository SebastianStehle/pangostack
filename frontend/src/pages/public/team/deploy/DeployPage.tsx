import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ServicePublicDto, useClients } from 'src/api';
import { Icon, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { DeploymentForm, DeploymentUpdate } from './DeploymentForm';
import { Service } from './Service';

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
      return clients.deployments.postTeamDeployment(teamId, {
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
        <div className="flex flex-col gap-2">
          <p className="text-mdx">{texts.deployments.selectService}</p>

          <div className="flex flex-col gap-2">
            {(loadedServices?.items || []).map((service) => (
              <Service key={service.id} service={service} onClick={setService} url={clients.url} />
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-500">* {texts.common.priceFromHint}</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
