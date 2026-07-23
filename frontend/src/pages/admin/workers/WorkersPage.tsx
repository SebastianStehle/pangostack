import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useClients, WorkerWithStatusDto } from 'src/api';
import { AdminHeader, Icon, NodeStatus, Page, RefreshButton } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { formatDateTime, formatTags } from 'src/lib';
import { texts } from 'src/texts';
import { UpsertWorkerDialog } from './UpsertWorkerDialog';
import { useWorkersStore } from './state';

// Each request pings all workers, therefore the status is kept up to date by polling.
const PING_INTERVAL_MS = 30000;

export const WorkersPage = () => {
  const clients = useClients();
  const { removeWorker, setWorkers, workers } = useWorkersStore();
  const [toCreate, setToCreate] = useState<boolean>();
  const [toUpdate, setToUpdate] = useState<WorkerWithStatusDto | null>(null);

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

  useEffect(() => {
    if (loadedWorkers) {
      setWorkers(loadedWorkers.items);
    }
  }, [loadedWorkers, setWorkers]);

  const doClose = useEventCallback(() => {
    setToUpdate(null);
    setToCreate(false);
  });

  const doUpsert = useEventCallback(() => {
    void refetch();
  });

  return (
    <Page>
      <AdminHeader title={texts.workers.headline}>
        <RefreshButton isLoading={isFetching} onClick={refetch} />

        <button className="btn btn-success text-sm text-white" onClick={() => setToCreate(true)}>
          <Icon icon="plus" size={16} /> {texts.workers.create}
        </button>
      </AdminHeader>

      {workers.length === 0 && isFetched && (
        <div role="alert" className="alert alert-warning mb-4">
          <Icon icon="alert" />
          {texts.workers.missingWarning}
        </div>
      )}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <table className="table table-fixed">
            <thead>
              <tr>
                <th>{texts.workers.endpoint}</th>
                <th className="w-32">{texts.common.status}</th>
                <th className="w-44">{texts.workers.startedAt}</th>
                <th className="w-64">{texts.workers.resourceTypes}</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker) => (
                <tr className="cursor-pointer hover:bg-slate-50" key={worker.id} onClick={() => setToUpdate(worker)}>
                  <td className="overflow-hidden font-semibold">{worker.endpoint}</td>
                  <td title={worker.status.error || undefined}>
                    <NodeStatus isReady={worker.status.isReady} message={texts.workers.unreachable} />
                  </td>
                  <td className="overflow-hidden">
                    {worker.status.startedAt ? formatDateTime(new Date(worker.status.startedAt)) : '-'}
                  </td>
                  <td className="truncate">{formatTags(worker.status.resourceTypes)}</td>
                </tr>
              ))}

              {workers.length === 0 && isFetched && (
                <tr>
                  <td colSpan={4}>{texts.workers.empty}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toCreate && <UpsertWorkerDialog onClose={doClose} onUpsert={doUpsert} />}
      {toUpdate && <UpsertWorkerDialog onClose={doClose} onDelete={removeWorker} onUpsert={doUpsert} target={toUpdate} />}
    </Page>
  );
};
