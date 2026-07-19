import { describe, expect, it } from 'vitest';
import { UserEntity } from 'src/domain/database';
import { buildUser } from './utils';

function userEntity(overrides: Partial<UserEntity>): UserEntity {
  return { id: 'u1', name: 'Alice', email: 'alice@example.com', ...overrides } as unknown as UserEntity;
}

describe('buildUser', () => {
  it('should report a password and drop the hash when one is set', () => {
    const result = buildUser(userEntity({ passwordHash: 'hashed' }));

    expect(result.hasPassword).toBe(true);
    expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
  });

  it('should report no password when the hash is empty', () => {
    const result = buildUser(userEntity({ passwordHash: null }));

    expect(result.hasPassword).toBe(false);
  });
});
