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

      <div className="flex flex-col gap-2">
        {activities.map((activity) => (
          <Activity key={activity.id} activity={activity} />
        ))}
      </div>

      {isLoading && !isFetched && <Spinner visible={true} />}

      {isFetched && activities.length === 0 && (
        <Empty icon="activity" label={texts.activities.empty} text={texts.activities.emptyText} />
      )}

      <Pagingation page={page} pageSize={PAGE_SIZE} total={loadedActivities?.total || 0} onPage={doChangePage} />
    </>
  );
};
