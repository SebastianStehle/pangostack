import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useClients } from 'src/api';
import { Empty, Pagingation, RefreshButton, Spinner } from 'src/components';
import { useEventCallback, useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { Activity } from './Activity';

const PAGE_SIZE = 20;

export const ActivityPage = () => {
  const { teamId } = useTypedParams({ teamId: 'int' });
  const clients = useClients();
  const [page, setPage] = useState(0);

  const {
    data: loadedActivities,
    refetch,
    isLoading,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['activities', teamId, page],
    queryFn: () => clients.activities.getTeamActivities(teamId, page, PAGE_SIZE),
  });

  const doChangePage = useEventCallback((page: number) => {
    setPage(page);
  });

  const activities = loadedActivities?.items || [];

  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h2 className="grow text-2xl">{texts.activities.headline}</h2>

        <RefreshButton isLoading={isFetching} onClick={refetch} />
      </div>

      {isLoading && !isFetched && <Spinner visible={true} />}

      {isFetched && (
        <table className="table">
          <thead>
            <tr>
              <th>{texts.activities.user}</th>
              <th>{texts.activities.event}</th>
              <th>{texts.activities.date}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {activities.map((activity) => (
              <Activity key={activity.id} activity={activity} />
            ))}

            {activities.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <Empty icon="no-document" label={texts.activities.empty} text={texts.activities.emptyText} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Pagingation page={page} pageSize={PAGE_SIZE} total={loadedActivities?.total || 0} onPage={doChangePage} />
    </>
  );
};
