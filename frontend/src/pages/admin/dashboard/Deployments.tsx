import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import { useClients } from 'src/api';
import { DeploymentStatus, HealthStatus, RefreshButton, VersionLabel } from 'src/components';
import { texts } from 'src/texts';

export const Deployments = () => {
  const clients = useClients();

  const {
    data: loadedDeployments,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => clients.deployments.getDeployments(),
  });

  const deployments = loadedDeployments?.items || [];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">{texts.workers.headline}</h2>

          <RefreshButton sm isLoading={isFetching} onClick={refetch} />
        </div>

        <table className="table table-fixed">
          <colgroup>
            <col className="w-16" />
            <col className="w-32" />
            <col />
            <col />
            <col className="w-32" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>{texts.common.status}</th>
              <th>{texts.common.health}</th>
              <th>{texts.common.service}</th>
              <th>{texts.common.version}</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((deployment) => (
              <tr className="hover:bg-slate-50" key={deployment.id}>
                <td className="overflow-hidden font-semibold">
                  <NavLink className="link-hover" to={`${deployment.id}`}>
                    {deployment.id}
                  </NavLink>
                </td>
                <td className="overflow-hidden text-sm">
                  <NavLink to={`/admin/deployments/${deployment.id}`}>
                    <DeploymentStatus status={deployment.status} />
                  </NavLink>
                </td>
                <td className="overflow-hidden text-sm">
                  <NavLink to={`/admin/deployments/${deployment.id}`}>
                    <HealthStatus status={deployment.healthStatus} />
                  </NavLink>
                </td>
                <td className="overflow-hidden">
                  <NavLink className="link-hover" to={`/admin/services/${deployment.serviceId}`}>
                    {deployment.serviceName}
                  </NavLink>
                </td>
                <td className="overflow-hidden">
                  <NavLink to={`/admin/services/${deployment.serviceId}`}>
                    <VersionLabel version={deployment.serviceVersion} />
                  </NavLink>
                </td>
              </tr>
            ))}

            {deployments.length === 0 && isFetched && (
              <tr>
                <td className="text-sm" colSpan={4}>
                  {texts.deployments.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
