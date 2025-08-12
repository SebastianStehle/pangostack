import { create } from 'zustand';
import { TeamUserDto } from 'src/api';

interface MembersState {
  // The members.
  members: TeamUserDto[];

  // Adds or sets an member.
  setMember: (member: TeamUserDto) => void;

  // Remove an user.
  removeMember: (id: string) => void;

  // Sets all members.
  setMembers: (members: TeamUserDto[]) => void;
}

export const useMembersStore = create<MembersState>()((set) => ({
  members: [],
  setMember: (member: TeamUserDto) => {
    return set((state) => {
      const members = [...state.members];

      const indexOfExisting = members.findIndex((x) => x.user.id === member.user.id);

      if (indexOfExisting >= 0) {
        members[indexOfExisting] = member;
      } else {
        members.push(member);
      }

      return { members };
    });
  },
  setMembers: (members: TeamUserDto[]) => {
    return set({ members });
  },
  removeMember: (id: string) => {
    return set((state) => ({ members: state.members.filter((x) => x.user.id !== id) }));
  },
}));
