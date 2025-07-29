import { create } from 'zustand';
import { UserGroupDto } from 'src/api';

interface UserGroupssState {
  // The user groups.
  userGroups: UserGroupDto[];

  // Adds or sets an user group.
  setUserGroup: (userGroup: UserGroupDto) => void;

  // Remove an user group.
  removeUserGroup: (id: string) => void;

  // Sets all user groups.
  setUserGroups: (userGroups: UserGroupDto[]) => void;
}

export const useUserGroupsStore = create<UserGroupssState>()((set) => ({
  userGroups: [],
  setUserGroup: (userGroup: UserGroupDto) => {
    return set((state) => {
      const userGroups = [...state.userGroups];

      const indexOfExisting = userGroups.findIndex((x) => x.id === userGroup.id);

      if (indexOfExisting >= 0) {
        userGroups[indexOfExisting] = userGroup;
      } else {
        userGroups.push(userGroup);
      }

      return { userGroups };
    });
  },
  setUserGroups: (userGroups: UserGroupDto[]) => {
    return set({ userGroups });
  },
  removeUserGroup: (id: string) => {
    return set((state) => ({ userGroups: state.userGroups.filter((x) => x.id !== id) }));
  },
}));
