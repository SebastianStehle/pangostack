import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useClients } from 'src/api';
import { Icon, TransientNavLink } from 'src/components';
import { texts } from 'src/texts';
import { HealthChart } from './HealthChart';
import { UsageChart } from './UsageChart';

export const DeploymentPage = () => {
  const { deploymentId, teamId } = useParams();
  const clients = useClients();

  const { data: loadedStatus } = useQuery({
    queryKey: ['status', teamId, deploymentId],
    queryFn: () => clients.deployments.getDeploymentStatus(+teamId!, +deploymentId!),
    refetchOnWindowFocus: false,
  });

  const status = loadedStatus?.resources || [];

  return (
    <>
      <div className="mb-4 flex h-10 items-center gap-4">
        <TransientNavLink className="btn btn-ghost btn-sm text-sm" to={`../${teamId}`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h3 className="grow text-xl">{texts.deployments.headline}</h3>
      </div>

      <UsageChart teamId={+teamId!} deploymentId={+deploymentId!} />

      <HealthChart teamId={+teamId!} deploymentId={+deploymentId!} />

      {status.length}
    </>
  );
};
