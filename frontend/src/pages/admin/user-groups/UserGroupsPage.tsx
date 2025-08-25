import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useClients, UserGroupDto } from 'src/api';
import { AdminHeader, Icon, Page, RefreshButton } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { formatBoolean } from 'src/lib';
import { texts } from 'src/texts';
import { UpsertUserGroupDialog } from './UpsertUserGroupDialog';
import { useUserGroupsStore } from './state';

export const UserGroupsPage = () => {
  const clients = useClients();
  const { removeUserGroup, setUserGroup, setUserGroups, userGroups } = useUserGroupsStore();
  const [toCreate, setToCreate] = useState<boolean>();
  const [toUpdate, setToUpdate] = useState<UserGroupDto | null>(null);

  const {
    data: loadedGroups,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['userGroups'],
    queryFn: () => clients.users.getUserGroups(),
  });

  useEffect(() => {
    if (loadedGroups) {
      setUserGroups(loadedGroups.items);
    }
  }, [loadedGroups, setUserGroups]);

  const doClose = useEventCallback(() => {
    setToUpdate(null);
    setToCreate(false);
  });

  return (
    <Page>
      <AdminHeader title={texts.userGroups.headline}>
        <RefreshButton sm isLoading={isFetching} onClick={refetch} />

        <button className="btn btn-success text-sm text-white" onClick={() => setToCreate(true)}>
          <Icon icon="plus" size={16} /> {texts.userGroups.create}
        </button>
      </AdminHeader>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <table className="table table-fixed">
            <thead>
              <tr>
                <th>{texts.common.name}</th>
                <th className="w-40">{texts.common.administration}</th>
                <th className="w-40">{texts.common.builtIn}</th>
              </tr>
            </thead>
            <tbody>
              {userGroups.map((userGroup) => (
                <tr className="cursor-pointer hover:bg-slate-50" key={userGroup.id} onClick={() => setToUpdate(userGroup)}>
                  <td className="overflow-hidden font-semibold">{userGroup.name}</td>
                  <td className="overflow-hidden">{formatBoolean(userGroup.isAdmin)}</td>
                  <td className="overflow-hidden">{formatBoolean(userGroup.isBuiltIn)}</td>
                </tr>
              ))}

              {userGroups.length === 0 && isFetched && (
                <tr>
                  <td colSpan={3}>{texts.userGroups.empty}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toCreate && <UpsertUserGroupDialog onClose={doClose} onUpsert={setUserGroup} />}
      {toUpdate && (
        <UpsertUserGroupDialog onClose={doClose} onDelete={removeUserGroup} onUpsert={setUserGroup} target={toUpdate} />
      )}
    </Page>
  );
};
