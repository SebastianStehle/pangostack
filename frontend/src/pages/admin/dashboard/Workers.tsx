import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { Icon, NodeStatus, RefreshButton, TransientNavLink } from 'src/components';
import { texts } from 'src/texts';

// Each request pings all workers, therefore the status is kept up to date by polling.
const PING_INTERVAL_MS = 30000;

export const Workers = () => {
  const clients = useClients();

  const {
    data: loadedWorkers,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['workers'],
    queryFn: () => clients.workers.getWorkers(),
    refetchInterval: PING_INTERVAL_MS,
  });

  const workers = loadedWorkers?.items || [];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">{texts.workers.headline}</h2>

          <RefreshButton sm isLoading={isFetching} onClick={refetch} />
        </div>

        {workers.length === 0 && isFetched && (
          <div role="alert" className="alert alert-warning">
            <Icon icon="alert" />
            <span>{texts.workers.missingWarning}</span>
            <TransientNavLink className="btn btn-sm" to="/admin/workers">
              {texts.workers.manage}
            </TransientNavLink>
          </div>
        )}

        <table className="table table-fixed">
          <colgroup>
            <col />
            <col className="w-32" />
          </colgroup>
          <thead>
            <tr>
              <th>{texts.workers.endpoint}</th>
              <th>{texts.common.status}</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => (
              <tr key={worker.id}>
                <td className="overflow-hidden">{worker.endpoint}</td>
                <td title={worker.status.error || undefined}>
                  <NodeStatus isReady={worker.status.isReady} />
                </td>
              </tr>
            ))}

            {workers.length === 0 && isFetched && (
              <tr>
                <td className="text-sm" colSpan={2}>
                  {texts.workers.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
