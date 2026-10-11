import { randomName } from 'src/shared/random';
import { createUser, TestUser } from 'src/shared/setup';
import { expect, test } from './fixtures';

test('should open deployments of team when team is created', async ({ teamCreatePage, teamDeploymentsPage }) => {
  const name = randomName('team');

  // STEP 1: Create team.
  await teamCreatePage.goto();
  await teamCreatePage.create(name);

  await expect(teamDeploymentsPage.heading).toBeVisible();
  await expect(teamDeploymentsPage.teamSwitcher(name)).toBeVisible();
});

test.describe('members', () => {
  let member: TestUser;

  test.beforeEach(async ({ admin }) => {
    member = await createUser(admin);
  });

  test('should add member when email belongs to a user', async ({ membersPage, team }) => {
    // STEP 1: Add member.
    await membersPage.goto(team.id);
    await membersPage.add(member.email);

    await expect(membersPage.member(member.email)).toBeVisible();

    // STEP 2: Reload to verify that the member was saved.
    await membersPage.reload();

    await expect(membersPage.member(member.email)).toBeVisible();
  });

  test('should remove member when confirmed', async ({ membersPage, admin, team }) => {
    // STEP 1: Add member through the API.
    await admin.teams.postTeamUser(team.id, { userIdOrEmail: member.email, role: 'Admin' });

    // STEP 2: Remove member.
    await membersPage.goto(team.id);
    await membersPage.remove(member.email);

    await expect(membersPage.member(member.email)).toBeHidden();
  });
});
