import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { TeamUserDto, useClients } from 'src/api';
import { Forms, Icon } from 'src/components';
import { useProfile, useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { AddMemberForm } from './AddMemberForm';
import { Member } from './Member';
import { useMembersStore } from './state';

export const MembersPage = () => {
  const { teamId } = useTypedParams({ teamId: 'int' });
  const clients = useClients();
  const profile = useProfile();
  const { members, removeMember, setMembers, setMember } = useMembersStore();

  const { data: loadedTeams } = useQuery({
    queryKey: ['members'],
    queryFn: () => clients.teams.getTeams(),
  });

  const deleting = useMutation({
    mutationFn: (member: TeamUserDto) => {
      return clients.teams.deleteTeamuser(teamId, member.user.id);
    },
    onSuccess: (_, member: TeamUserDto) => {
      removeMember(member.user.id);
    },
  });

  useEffect(() => {
    const team = loadedTeams?.items.find((x) => x.id === teamId);

    if (team) {
      setMembers(team.users);
    }
  }, [loadedTeams?.items, setMembers, teamId]);

  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h2 className="grow text-2xl">{texts.members.headline}</h2>

        <div className="h-10"></div>
      </div>

      <div role="alert" className="alert alert-info mb-4">
        <Icon icon="info" />
        <span>{texts.members.memberHints}</span>
      </div>

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <Member key={member.user.id} member={member} profile={profile} onRemove={deleting.mutate} />
        ))}
      </div>

      <h3 className="mt-6 mb-2 text-xl">{texts.members.addMemberTitle}</h3>

      <div className="max-w-[500px]">
        <Forms.Hints className="mb-2" hints={texts.members.addMemberHint} />

        <AddMemberForm teamId={teamId} onCreate={setMember} />
      </div>
    </>
  );
};
