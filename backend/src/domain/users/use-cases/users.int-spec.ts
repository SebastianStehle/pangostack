import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  asUser,
  createIntegrationTest,
  IntegrationTestContext,
  seedTeam,
  seedTeamUser,
  seedUser,
  seedUserGroup,
  uniqueId,
} from 'test/integration/setup';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { TeamEntity, TeamUserEntity, UserEntity, UserGroupEntity } from 'src/domain/database';
import { MemberAddedEvent } from 'src/domain/events';
import { NotificationsService } from 'src/domain/notifications';
import {
  CreateTeam,
  CreateTeamHandler,
  CreateTeamResult,
  CreateUser,
  CreateUserGroup,
  CreateUserGroupHandler,
  CreateUserGroupResult,
  CreateUserHandler,
  CreateUserResult,
  DeleteTeamUser,
  DeleteTeamUserHandler,
  DeleteTeamUserResult,
  DeleteUser,
  DeleteUserGroup,
  DeleteUserGroupHandler,
  DeleteUserHandler,
  GetTeamsHandler,
  GetTeamsQuery,
  GetTeamsResult,
  GetUserGroupHandler,
  GetUserGroupQuery,
  GetUserGroupResult,
  GetUserGroupsHandler,
  GetUserGroupsQuery,
  GetUserGroupsResponse,
  GetUserHandler,
  GetUserQuery,
  GetUserResult,
  GetUsersHandler,
  GetUsersQuery,
  GetUsersResult,
  SetTeamUser,
  SetTeamUserHandler,
  SetTeamUserResponse,
  UpdateTeam,
  UpdateTeamHandler,
  UpdateTeamResult,
  UpdateUser,
  UpdateUserGroup,
  UpdateUserGroupHandler,
  UpdateUserGroupResult,
  UpdateUserHandler,
  UpdateUserResult,
} from '.';

const notifications = { upsertUsers: vi.fn(), subscribe: vi.fn(), unsubscribe: vi.fn(), notify: vi.fn() };
const MISSING_TEAM_ID = 2147483000;

describe('users handlers', () => {
  let context: IntegrationTestContext;
  let events: EventEmitter2;

  beforeAll(async () => {
    context = await createIntegrationTest({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forFeature([TeamEntity, TeamUserEntity, UserEntity, UserGroupEntity]),
      ],
      providers: [
        CreateTeamHandler,
        UpdateTeamHandler,
        GetTeamsHandler,
        SetTeamUserHandler,
        DeleteTeamUserHandler,
        CreateUserHandler,
        UpdateUserHandler,
        DeleteUserHandler,
        GetUserHandler,
        GetUsersHandler,
        CreateUserGroupHandler,
        UpdateUserGroupHandler,
        DeleteUserGroupHandler,
        GetUserGroupHandler,
        GetUserGroupsHandler,
        { provide: NotificationsService, useValue: notifications },
      ],
    });

    events = context.app.get(EventEmitter2);
  });

  afterAll(async () => {
    await context.close();
  });

  describe('CreateTeam', () => {
    it('should create a team with the creator as admin member', async () => {
      const user = asUser(await seedUser(context.dataSource));

      const { team } = await context.commandBus.execute<CreateTeam, CreateTeamResult>(
        new CreateTeam({ name: uniqueId('team') }, user),
      );

      expect(team.users).toHaveLength(1);
      expect(team.users[0].role).toBe('Admin');
      expect(team.users[0].user.id).toBe(user.id);
    });

    it('should emit a member added event when a team is created', async () => {
      const emit = vi.spyOn(events, 'emit');
      const user = asUser(await seedUser(context.dataSource));

      const { team } = await context.commandBus.execute<CreateTeam, CreateTeamResult>(
        new CreateTeam({ name: uniqueId('team') }, user),
      );

      expect(emit).toHaveBeenCalledWith(
        MemberAddedEvent.TYPE,
        expect.objectContaining({ teamId: team.id, member: user.email, userId: user.id }),
      );
    });
  });

  describe('UpdateTeam', () => {
    it('should update the team name', async () => {
      const team = await seedTeam(context.dataSource);
      const name = uniqueId('team');

      const { team: updated } = await context.commandBus.execute<UpdateTeam, UpdateTeamResult>(new UpdateTeam(team.id, { name }));

      expect(updated.name).toBe(name);
    });

    it('should throw when the team does not exist', async () => {
      await expect(
        context.commandBus.execute<UpdateTeam, UpdateTeamResult>(new UpdateTeam(MISSING_TEAM_ID, { name: uniqueId('team') })),
      ).rejects.toThrow('not found');
    });
  });

  describe('GetTeamsQuery', () => {
    it('should return only teams the user belongs to', async () => {
      const user = await seedUser(context.dataSource);
      const member = await seedTeam(context.dataSource);
      await seedTeam(context.dataSource);
      await seedTeamUser(context.dataSource, member.id, user.id);

      const { teams } = await context.queryBus.execute<GetTeamsQuery, GetTeamsResult>(new GetTeamsQuery(asUser(user)));

      expect(teams.map((team) => team.id)).toEqual([member.id]);
    });

    it('should return an empty list when the user has no teams', async () => {
      const user = asUser(await seedUser(context.dataSource));

      const { teams } = await context.queryBus.execute<GetTeamsQuery, GetTeamsResult>(new GetTeamsQuery(user));

      expect(teams).toEqual([]);
    });
  });

  describe('SetTeamUser', () => {
    it('should add a user to a team with the given role', async () => {
      const actor = await seedUser(context.dataSource);
      const target = await seedUser(context.dataSource);
      const team = await seedTeam(context.dataSource);
      await seedTeamUser(context.dataSource, team.id, actor.id, 'Admin');

      const { team: result } = await context.commandBus.execute<SetTeamUser, SetTeamUserResponse>(
        new SetTeamUser(team.id, target.id, asUser(actor), 'Member'),
      );

      expect(result.users.find((teamUser) => teamUser.user.id === target.id)?.role).toBe('Member');
    });

    it('should reject adding yourself', async () => {
      const actor = await seedUser(context.dataSource);
      const team = await seedTeam(context.dataSource);

      await expect(
        context.commandBus.execute<SetTeamUser, SetTeamUserResponse>(new SetTeamUser(team.id, actor.id, asUser(actor), 'Member')),
      ).rejects.toThrow('cannot add yourself');
    });
  });

  describe('DeleteTeamUser', () => {
    it('should remove a user from a team', async () => {
      const actor = await seedUser(context.dataSource);
      const target = await seedUser(context.dataSource);
      const team = await seedTeam(context.dataSource);
      await seedTeamUser(context.dataSource, team.id, actor.id, 'Admin');
      await seedTeamUser(context.dataSource, team.id, target.id, 'Member');

      const { team: result } = await context.commandBus.execute<DeleteTeamUser, DeleteTeamUserResult>(
        new DeleteTeamUser(team.id, target.id, asUser(actor)),
      );

      expect(result.users.find((teamUser) => teamUser.user.id === target.id)).toBeUndefined();
    });

    it('should reject removing yourself', async () => {
      const actor = await seedUser(context.dataSource);
      const team = await seedTeam(context.dataSource);
      await seedTeamUser(context.dataSource, team.id, actor.id, 'Admin');

      await expect(
        context.commandBus.execute<DeleteTeamUser, DeleteTeamUserResult>(new DeleteTeamUser(team.id, actor.id, asUser(actor))),
      ).rejects.toThrow('cannot remove yourself');
    });
  });

  describe('CreateUser', () => {
    it('should create a user with the given id and a hashed password', async () => {
      const group = await seedUserGroup(context.dataSource);
      const id = uniqueId('user');
      const email = `${id}@example.com`;

      const { user } = await context.commandBus.execute<CreateUser, CreateUserResult>(
        new CreateUser({ id, apiKey: null, email, name: 'New User', roles: null, userGroupId: group.id, password: 'secret' }),
      );

      const saved = await context.dataSource.getRepository(UserEntity).findOneByOrFail({ id });
      expect(user.id).toBe(id);
      expect(user.hasPassword).toBe(true);
      expect(saved.passwordHash).toBeTruthy();
      expect(saved.passwordHash).not.toBe('secret');
      expect(notifications.upsertUsers).toHaveBeenCalled();
    });

    it('should create a user without a password', async () => {
      const group = await seedUserGroup(context.dataSource);
      const id = uniqueId('user');

      const { user } = await context.commandBus.execute<CreateUser, CreateUserResult>(
        new CreateUser({ id, apiKey: null, email: `${id}@example.com`, name: 'No Password', roles: null, userGroupId: group.id }),
      );

      const saved = await context.dataSource.getRepository(UserEntity).findOneByOrFail({ id });
      expect(user.hasPassword).toBe(false);
      expect(saved.passwordHash).toBeNull();
    });
  });

  describe('UpdateUser', () => {
    it('should update the user name', async () => {
      const seeded = await seedUser(context.dataSource);

      const { user } = await context.commandBus.execute<UpdateUser, UpdateUserResult>(
        new UpdateUser(seeded.id, { name: 'Renamed' }),
      );

      expect(user.name).toBe('Renamed');
    });

    it('should throw when the user does not exist', async () => {
      await expect(
        context.commandBus.execute<UpdateUser, UpdateUserResult>(new UpdateUser(uniqueId('missing'), { name: 'X' })),
      ).rejects.toThrow('not found');
    });
  });

  describe('DeleteUser', () => {
    it('should delete the user', async () => {
      const seeded = await seedUser(context.dataSource);

      await context.commandBus.execute(new DeleteUser(seeded.id));

      expect(await context.dataSource.getRepository(UserEntity).findOneBy({ id: seeded.id })).toBeNull();
    });

    it('should throw when the user does not exist', async () => {
      await expect(context.commandBus.execute(new DeleteUser(uniqueId('missing')))).rejects.toThrow('not found');
    });
  });

  describe('GetUserQuery', () => {
    it('should return the requested user', async () => {
      const seeded = await seedUser(context.dataSource);

      const { user } = await context.queryBus.execute<GetUserQuery, GetUserResult>(new GetUserQuery(seeded.id));

      expect(user?.id).toBe(seeded.id);
    });

    it('should return no user for a missing id', async () => {
      const { user } = await context.queryBus.execute<GetUserQuery, GetUserResult>(new GetUserQuery(uniqueId('missing')));

      expect(user).toBeFalsy();
    });
  });

  describe('GetUsersQuery', () => {
    it('should filter users by the search query', async () => {
      const marker = uniqueId('name');
      await seedUser(context.dataSource, { name: marker });

      const { users, total } = await context.queryBus.execute<GetUsersQuery, GetUsersResult>(new GetUsersQuery(0, 10, marker));

      expect(total).toBe(1);
      expect(users[0].name).toBe(marker);
    });

    it('should page through the matching users', async () => {
      const marker = uniqueId('page');
      await seedUser(context.dataSource, { name: `${marker}-a` });
      await seedUser(context.dataSource, { name: `${marker}-b` });

      const { users, total } = await context.queryBus.execute<GetUsersQuery, GetUsersResult>(new GetUsersQuery(0, 1, marker));

      expect(total).toBe(2);
      expect(users).toHaveLength(1);
    });
  });

  describe('CreateUserGroup', () => {
    it('should create a user group with the given id', async () => {
      const id = uniqueId('group');
      const name = uniqueId('group');

      const { userGroup } = await context.commandBus.execute<CreateUserGroup, CreateUserGroupResult>(
        new CreateUserGroup({ id, name }),
      );

      expect(userGroup.id).toBe(id);
      expect(userGroup.name).toBe(name);
    });

    it('should default to a non-builtin, non-admin group', async () => {
      const { userGroup } = await context.commandBus.execute<CreateUserGroup, CreateUserGroupResult>(
        new CreateUserGroup({ id: uniqueId('group'), name: uniqueId('group') }),
      );

      expect(userGroup.isBuiltIn).toBe(false);
      expect(userGroup.isAdmin).toBe(false);
    });
  });

  describe('UpdateUserGroup', () => {
    it('should update a non-builtin user group', async () => {
      const group = await seedUserGroup(context.dataSource);
      const name = uniqueId('group');

      const { userGroup } = await context.commandBus.execute<UpdateUserGroup, UpdateUserGroupResult>(
        new UpdateUserGroup(group.id, { name }),
      );

      expect(userGroup.name).toBe(name);
    });

    it('should reject updating a builtin user group', async () => {
      const group = await seedUserGroup(context.dataSource, { isBuiltIn: true });

      await expect(
        context.commandBus.execute<UpdateUserGroup, UpdateUserGroupResult>(
          new UpdateUserGroup(group.id, { name: uniqueId('group') }),
        ),
      ).rejects.toThrow('Cannot update builtin user group.');
    });
  });

  describe('DeleteUserGroup', () => {
    it('should delete a non-builtin user group', async () => {
      const group = await seedUserGroup(context.dataSource);

      await context.commandBus.execute(new DeleteUserGroup(group.id));

      expect(await context.dataSource.getRepository(UserGroupEntity).findOneBy({ id: group.id })).toBeNull();
    });

    it('should reject deleting a builtin user group', async () => {
      const group = await seedUserGroup(context.dataSource, { isBuiltIn: true });

      await expect(context.commandBus.execute(new DeleteUserGroup(group.id))).rejects.toThrow(
        'Cannot delete builtin user group.',
      );
    });
  });

  describe('GetUserGroupQuery', () => {
    it('should return the requested user group', async () => {
      const group = await seedUserGroup(context.dataSource);

      const { userGroup } = await context.queryBus.execute<GetUserGroupQuery, GetUserGroupResult>(
        new GetUserGroupQuery(group.id),
      );

      expect(userGroup?.id).toBe(group.id);
    });

    it('should return no group for a missing id', async () => {
      const { userGroup } = await context.queryBus.execute<GetUserGroupQuery, GetUserGroupResult>(
        new GetUserGroupQuery(uniqueId('missing')),
      );

      expect(userGroup).toBeFalsy();
    });
  });

  describe('GetUserGroupsQuery', () => {
    it('should return a seeded user group among the results', async () => {
      const group = await seedUserGroup(context.dataSource);

      const { userGroups } = await context.queryBus.execute<GetUserGroupsQuery, GetUserGroupsResponse>(new GetUserGroupsQuery());

      expect(userGroups.map((userGroup) => userGroup.id)).toContain(group.id);
    });

    it('should return multiple seeded user groups', async () => {
      const first = await seedUserGroup(context.dataSource);
      const second = await seedUserGroup(context.dataSource);

      const { userGroups } = await context.queryBus.execute<GetUserGroupsQuery, GetUserGroupsResponse>(new GetUserGroupsQuery());

      const ids = userGroups.map((userGroup) => userGroup.id);
      expect(ids).toContain(first.id);
      expect(ids).toContain(second.id);
    });
  });
});
