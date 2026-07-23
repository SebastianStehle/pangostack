import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from 'src/api';
import { DeploymentStatus, HealthStatus, Pagingation, RefreshButton, VersionLabel } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { texts } from 'src/texts';

export const Deployments = ({ serviceId }: { serviceId: number }) => {
  const clients = useClients();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const {
    data: loadedDeployments,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['service-deployments', serviceId, page],
    queryFn: () => clients.services.getServiceDeployments(serviceId, page, 20),
  });

  const doChangePage = useEventCallback((page: number) => {
    setPage(page);
  });

  const deployments = loadedDeployments?.items || [];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">{texts.deployments.headline}</h2>

          <RefreshButton isLoading={isFetching} onClick={refetch} />
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
              <th>{texts.common.version}</th>
              <th>{texts.common.status}</th>
              <th>{texts.common.health}</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((deployment) => (
              <tr
                className="cursor-pointer hover:bg-slate-50"
                key={deployment.id}
                onClick={() => navigate(`/admin/deployments/${deployment.id}`)}
              >
                <td className="overflow-hidden font-semibold">{deployment.id}</td>
                <td className="overflow-hidden">
                  <VersionLabel version={deployment.serviceVersion} />
                </td>
                <td className="overflow-hidden text-sm">
                  <DeploymentStatus status={deployment.status} />
                </td>
                <td className="overflow-hidden text-sm">
                  <HealthStatus status={deployment.healthStatus} />
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
  );
};
