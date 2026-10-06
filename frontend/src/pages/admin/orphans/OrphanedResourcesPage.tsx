import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { GetOrphanedResourcesStatusEnum, useClients } from 'src/api';
import { AdminHeader, Icon, Page, Pagingation, RefreshButton } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { formatDateTime } from 'src/lib';
import { texts } from 'src/texts';
import { OrphanedResourceStatusButtons } from './OrphanedResourceStatusButtons';
import { useOrphanedResourcesStore } from './state';

const PAGE_SIZE = 20;

export const OrphanedResourcesPage = () => {
  const clients = useClients();
  const { orphanedResources, setOrphanedResource, setOrphanedResources } = useOrphanedResourcesStore();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<GetOrphanedResourcesStatusEnum | ''>('Open');

  const {
    data: loadedOrphanedResources,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['orphaned-resources', page, status],
    queryFn: () => clients.orphanedResources.getOrphanedResources(page, PAGE_SIZE, status || undefined),
  });

  useEffect(() => {
    if (loadedOrphanedResources) {
      setOrphanedResources(loadedOrphanedResources.items);
    }
  }, [loadedOrphanedResources, setOrphanedResources]);

  const doChangePage = useEventCallback((page: number) => {
    setPage(page);
  });

  const doChangeStatus = useEventCallback((status: GetOrphanedResourcesStatusEnum | '') => {
    setPage(0);
    setStatus(status);
  });

  return (
    <Page>
      <AdminHeader title={texts.orphanedResources.headline}>
        <RefreshButton isLoading={isFetching} onClick={refetch} />

        <select
          className="select select-bordered"
          value={status}
          onChange={(event) => doChangeStatus(event.target.value as GetOrphanedResourcesStatusEnum | '')}
        >
          <option>{texts.orphanedResources.statusAll}</option>
          <option value={GetOrphanedResourcesStatusEnum.Open}>{texts.orphanedResources.statusOpen}</option>
          <option value={GetOrphanedResourcesStatusEnum.Ignored}>{texts.orphanedResources.statusIgnored}</option>
          <option value={GetOrphanedResourcesStatusEnum.Deleted}>{texts.orphanedResources.statusDeleted}</option>
        </select>
      </AdminHeader>

      <div role="alert" className="alert alert-info mb-4">
        <Icon icon="info" />
        {texts.orphanedResources.manualHint}
        <br />
        {texts.orphanedResources.partialHint}
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <table className="table table-fixed">
            <thead>
              <tr>
                <th>{texts.orphanedResources.resource}</th>
                <th className="w-40">{texts.common.type}</th>
                <th className="w-40">{texts.orphanedResources.detectedAt}</th>
                <th className="w-40">{texts.orphanedResources.lastSeenAt}</th>
                <th className="w-28">{texts.common.status}</th>
                <th className="w-64"></th>
              </tr>
            </thead>
            <tbody>
              {orphanedResources.map((orphanedResource) => (
                <tr key={orphanedResource.id}>
                  <td className="truncate overflow-hidden font-semibold">{orphanedResource.resourceUniqueId}</td>
                  <td className="truncate overflow-hidden">{orphanedResource.resourceType}</td>
                  <td className="overflow-hidden">{formatDateTime(orphanedResource.detectedAt)}</td>
                  <td className="overflow-hidden">{formatDateTime(orphanedResource.lastSeenAt)}</td>
                  <td className="overflow-hidden">
                    {orphanedResource.status === 'Deleted' ? (
                      <span>{texts.orphanedResources.statusDeleted}</span>
                    ) : orphanedResource.status === 'Ignored' ? (
                      <span>{texts.orphanedResources.statusIgnored}</span>
                    ) : (
                      <span>{texts.orphanedResources.statusDeleted}</span>
                    )}
                  </td>
                  <td className="overflow-hidden">
                    <OrphanedResourceStatusButtons onStatus={setOrphanedResource} orphanedResource={orphanedResource} />
                  </td>
                </tr>
              ))}

              {orphanedResources.length === 0 && isFetched && (
                <tr>
                  <td className="text-sm" colSpan={6}>
                    {texts.orphanedResources.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagingation page={page} pageSize={PAGE_SIZE} total={loadedOrphanedResources?.total || 0} onPage={doChangePage} />
        </div>
      </div>
    </Page>
  );
};
