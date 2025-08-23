import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useClients } from 'src/api';
import { AdminHeader, DeploymentStatus, HealthStatus, Page, Pagingation, RefreshButton, VersionLabel } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { texts } from 'src/texts';

export const DeploymentsPage = () => {
  const clients = useClients();
  const [page, setPage] = useState(0);

  const {
    data: loadedDeployments,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['deployments', page],
    queryFn: () => clients.deployments.getDeployments(page, 20),
  });

  const doChangePage = useEventCallback((page: number) => {
    setPage(page);
  });

  const deployments = loadedDeployments?.items || [];

  return (
    <Page>
      <AdminHeader title={texts.deployments.headline}>
        <RefreshButton isLoading={isFetching} onClick={refetch} />
      </AdminHeader>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <table className="table table-fixed text-base">
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
                    <NavLink to={`${deployment.id}`}>
                      <DeploymentStatus status={deployment.status} />
                    </NavLink>
                  </td>
                  <td className="overflow-hidden text-sm">
                    <NavLink to={`${deployment.id}`}>
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

          <Pagingation page={page} pageSize={20} total={loadedDeployments?.total || 0} onPage={doChangePage} />
        </div>
      </div>
    </Page>
  );
};
