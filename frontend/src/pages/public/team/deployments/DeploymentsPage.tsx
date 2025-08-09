import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useClients } from 'src/api';
import { DeploymentStatus, Empty, HealthStatus, Icon, TransientNavLink } from 'src/components';
import { formatDateTime } from 'src/lib';
import { texts } from 'src/texts';

export const DeploymentsPage = () => {
  const { teamId } = useParams();
  const clients = useClients();

  const { data: loadedDeployments, isFetched } = useQuery({
    queryKey: ['deployments', teamId],
    queryFn: () => clients.deployments.getDeployments(+teamId!),
    refetchOnWindowFocus: false,
  });

  const deployments = loadedDeployments?.items || [];

  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h2 className="grow text-2xl">{texts.deployments.headline}</h2>

        <TransientNavLink className="btn btn-success" to="new">
          <Icon icon="plus" /> {texts.deployments.create}
        </TransientNavLink>
      </div>

      <div className="flex flex-col gap-2">
        {deployments.map((deployment) => (
          <TransientNavLink
            key={deployment.id}
            to={deployment.id.toString()}
            className="card card-border bg-base border-slate-200 shadow-sm"
          >
            <div className="card-body">
              <h2 className="card-title">
                <div className="badge badge-primary badge-sm me-1 rounded-full font-normal">{deployment.serviceVersion}</div>
                {deployment.serviceName}
              </h2>
              <div className="mt-2 grid grid-cols-3 items-center gap-4">
                <HealthStatus status={deployment.healthStatus} />
                <div className="flex items-center gap-1">
                  <DeploymentStatus status={deployment.status} /> {texts.common.installation}
                </div>
                <div className="flex items-center justify-end gap-2 text-right">
                  {texts.common.createdAt} {formatDateTime(deployment.createdAt)}
                </div>
              </div>
            </div>
          </TransientNavLink>
        ))}
      </div>

      {isFetched && deployments.length === 0 && (
        <Empty icon="no-connection" label={texts.deployments.emptyLabel} text={texts.deployments.emptyText} />
      )}
    </>
  );
};
