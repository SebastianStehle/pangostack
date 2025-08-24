import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { NodeStatus, RefreshButton } from 'src/components';
import { texts } from 'src/texts';

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
  });

  const workers = loadedWorkers?.items || [];

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title">{texts.workers.headline}</h2>

          <RefreshButton isLoading={isFetching} onClick={refetch} />
        </div>

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
              <tr>
                <td className="overflow-hidden">{worker.endpoint}</td>
                <td>
                  <NodeStatus isReady={worker.isReady} />
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
