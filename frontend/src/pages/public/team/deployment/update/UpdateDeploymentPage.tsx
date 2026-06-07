import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useClients } from 'src/api';
import { Icon, Spinner, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { DeploymentForm, DeploymentUpdate } from '../../deploy/DeploymentForm';

export const UpdateDeploymentPage = () => {
  const { deploymentId, teamId } = useTypedParams({ teamId: 'int', deploymentId: 'int' });
  const clients = useClients();
  const navigate = useNavigate();

  const { data: deployment } = useQuery({
    queryKey: ['deployment', deploymentId],
    queryFn: () => clients.deployments.getDeployment(deploymentId),
  });

  const serviceId = deployment?.serviceId || 0;

  const { data: loadedService } = useQuery({
    queryKey: ['service-public-version', serviceId, deployment?.serviceVersion],
    queryFn: () => clients.services.getServicePublicVersion(serviceId, deployment!.serviceVersion),
    enabled: !!serviceId && !!deployment,
  });

  const updating = useMutation({
    mutationFn: ({ name, parameters }: DeploymentUpdate) => {
      return clients.deployments.putDeployment(deploymentId, { name, parameters, versionId: null });
    },
    onSuccess: () => {
      navigate(`/teams/${teamId}/deployments/${deploymentId}`);
      toast(texts.common.saved, { type: 'success' });
    },
  });

  if (!deployment || !loadedService) {
    return <Spinner visible={true} />;
  }

  return (
    <div>
      <div className="mb-8 flex h-10 items-center gap-4">
        <TransientNavLink className="btn btn-ghost btn-circle text-sm" to={`../${teamId}`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h2 className="grow text-2xl">{texts.deployments.updateHeadline}</h2>
      </div>

      <DeploymentForm service={loadedService} onSubmit={updating.mutate} isPending={updating.isPending} value={deployment} />
    </div>
  );
};
