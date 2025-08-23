import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useClients, UserDto, UserGroupDto } from 'src/api';
import { AdminHeader, Icon, Page, Pagingation, RefreshButton, Search } from 'src/components';
import { useEventCallback } from 'src/hooks';
import { formatBoolean, formatTags } from 'src/lib';
import { texts } from 'src/texts';
import { CreateUserDialog } from './CreateUserDialog';
import { UpdateUserDialog } from './UpsertUserDialog';
import { useUsersStore } from './state';

const EMPTY_USER_GROUPS: UserGroupDto[] = [];

export const UsersPage = () => {
  const clients = useClients();
  const { removeUser, setUser, setUsers, users } = useUsersStore();
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState<string>();
  const [toCreate, setToCreate] = useState<boolean>();
  const [toUpdate, setToUpdate] = useState<UserDto | null>(null);

  const {
    data: loadedUsers,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryKey: ['users', page, query],
    queryFn: () => clients.users.getUsers(page, 20, query),
  });

  const { data: loadedGroups } = useQuery({
    queryKey: ['user-groups'],
    queryFn: async () => await clients.users.getUserGroups(),
  });

  useEffect(() => {
    if (loadedUsers) {
      setUsers(loadedUsers.items);
    }
  }, [loadedUsers, setUsers]);

  const doChangePage = useEventCallback((page: number) => {
    setPage(page);
  });

  const doClose = useEventCallback(() => {
    setToUpdate(null);
    setToCreate(false);
  });

  const userGroups = loadedGroups?.items || EMPTY_USER_GROUPS;

  return (
    <Page>
      <AdminHeader title={texts.users.headline}>
        <RefreshButton isLoading={isFetching} onClick={refetch} />

        <Search value={query} onSearch={setQuery} />

        <button className="btn btn-success text-sm text-white" onClick={() => setToCreate(true)}>
          <Icon icon="plus" size={16} /> {texts.users.create}
        </button>
      </AdminHeader>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <table className="table table-fixed text-base">
            <thead>
              <tr>
                <th>{texts.common.name}</th>
                <th>{texts.common.email}</th>
                <th>{texts.common.userGroup}</th>
                <th>{texts.common.roles}</th>
                <th className="w-24">{texts.common.apiKey}</th>
                <th className="w-24">{texts.common.password}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="cursor-pointer hover:bg-slate-50" key={user.id} onClick={() => setToUpdate(user)}>
                  <td className="truncate overflow-hidden font-semibold">{user.name}</td>
                  <td className="truncate overflow-hidden">{user.email}</td>
                  <td className="overflow-hidden">{userGroups.find((x) => x.id === user.userGroupId)?.name}</td>
                  <td className="overflow-hidden">{formatTags(user.roles)}</td>
                  <td className="overflow-hidden">{formatBoolean(!!user.apiKey)}</td>
                  <td className="overflow-hidden">{formatBoolean(user.hasPassword)}</td>
                </tr>
              ))}

              {users.length === 0 && isFetched && (
                <tr>
                  <td className="text-sm" colSpan={8}>
                    {texts.users.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagingation page={page} pageSize={20} total={loadedUsers?.total || 0} onPage={doChangePage} />
        </div>
      </div>

      {toCreate && <CreateUserDialog userGroups={userGroups} onClose={doClose} onCreate={setUser} />}
      {toUpdate && (
        <UpdateUserDialog onClose={doClose} onDelete={removeUser} onUpdate={setUser} target={toUpdate} userGroups={userGroups} />
      )}
    </Page>
  );
};
