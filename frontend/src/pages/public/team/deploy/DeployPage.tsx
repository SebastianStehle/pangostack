import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useClients } from 'src/api';
import { Icon, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { DeploymentForm, DeploymentUpdate } from './DeploymentForm';

export const DeployPage = () => {
  const { serviceId, teamId } = useTypedParams({ teamId: 'int', serviceId: 'int' });
  const clients = useClients();
  const navigate = useNavigate();

  const { data: service } = useQuery({
    queryKey: ['services-public', serviceId],
    queryFn: () => clients.services.getServicePublic(serviceId),
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

  if (!service) {
    return null;
  }

  return (
    <div>
      <div className="mb-8 flex h-10 items-center gap-4">
        <TransientNavLink className="btn btn-ghost btn-circle text-sm" to={`../deployments/new`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h2 className="grow text-2xl">{texts.deployments.deployHeadline}</h2>
      </div>

      <DeploymentForm service={service} onSubmit={creating.mutate} isPending={creating.isPending} />
    </div>
  );
};
