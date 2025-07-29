import { create } from 'zustand';
import { UserDto } from 'src/api';

interface UsersState {
  // The users.
  users: UserDto[];

  // Adds or sets an user.
  setUser: (user: UserDto) => void;

  // Remove an user.
  removeUser: (id: string) => void;

  // Sets all users.
  setUsers: (users: UserDto[]) => void;
}

export const useUsersStore = create<UsersState>()((set) => ({
  users: [],
  setUser: (user: UserDto) => {
    return set((state) => {
      const users = [...state.users];

      const indexOfExisting = users.findIndex((x) => x.id === user.id);

      if (indexOfExisting >= 0) {
        users[indexOfExisting] = user;
      } else {
        users.push(user);
      }

      return { users };
    });
  },
  setUsers: (users: UserDto[]) => {
    return set({ users });
  },
  removeUser: (id: string) => {
    return set((state) => ({ users: state.users.filter((x) => x.id !== id) }));
  },
}));
