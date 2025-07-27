import { TeamEntity, UserEntity, UserGroupEntity } from 'src/domain/database';
import { Team, User, UserGroup } from '../interfaces';

export function buildUser(source: UserEntity): User {
  const { passwordHash, ...other } = source;

  return { ...other, hasPassword: !!passwordHash };
}

export function buildTeam(source: TeamEntity): Team {
  const { id, name, users } = source;

  return { id, name, users: users?.map((x) => ({ role: x.role, user: buildUser(x.user) })) || [] };
}

export function buildUserGroup(source: UserGroupEntity): UserGroup {
  return source;
}
