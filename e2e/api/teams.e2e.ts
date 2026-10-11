import { beforeEach, describe, expect, it } from 'vitest';
import { TeamDto } from 'src/api/generated';
import { createAdminClients, getStatusCode } from 'src/shared/clients';
import { randomName } from 'src/shared/random';
import { createTeam, createUser, TestUser } from 'src/shared/setup';

describe('teams', () => {
  const admin = createAdminClients();

  let owner: TestUser;
  let other: TestUser;
  let team: TeamDto;

  beforeEach(async () => {
    owner = await createUser(admin);
    other = await createUser(admin);
    team = await createTeam(owner.clients);
  });

  it('should add creator as member when team is created', async () => {
    // STEP 1: Get teams of the creator.
    const { items } = await owner.clients.teams.getTeams();

    const created = items.find(({ id }) => id === team.id);
    expect(created?.users.map(({ user: { email } }) => email)).toEqual([owner.email]);
  });

  it('should give access to team when member is added', async () => {
    // STEP 1: Add member.
    await owner.clients.teams.postTeamUser(team.id, { userIdOrEmail: other.email, role: 'Admin' });

    // STEP 2: Get teams of the member.
    const { items } = await other.clients.teams.getTeams();
    expect(items.map(({ id }) => id)).toContain(team.id);
  });

  it('should forbid renaming team when user is not a member', async () => {
    // STEP 1: Rename team as a user outside of it.
    const status = await getStatusCode(() => other.clients.teams.putTeam(team.id, { name: randomName('renamed') }));
    expect(status).toBe(403);
  });
});
