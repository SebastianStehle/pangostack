import { UserEntity, UserGroupEntity } from 'src/domain/database';
import { User, UserGroup } from '../interfaces';

export function buildUser(source: UserEntity): User {
  const { passwordHash, ...other } = source;

  return { ...other, hasPassword: !!passwordHash };
}

export function buildUserGroup(source: UserGroupEntity): UserGroup {
  return source;
}
