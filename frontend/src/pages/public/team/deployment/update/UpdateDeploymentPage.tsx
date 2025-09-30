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

  const { data: loadedServices } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => clients.services.getServicesPublic(),
  });

  const { data: deployment } = useQuery({
    queryKey: ['deployment', deploymentId],
    queryFn: () => clients.deployments.getDeployment(deploymentId),
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

  if (!deployment) {
    return <Spinner visible={true} />;
  }

  const service = (loadedServices?.items || []).find((x) => x.id === deployment.serviceId);

  if (!service) {
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

      <DeploymentForm service={service} onSubmit={updating.mutate} isPending={updating.isPending} value={deployment} />
    </div>
  );
};
