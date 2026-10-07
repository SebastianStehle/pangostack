import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BUILTIN_USER_GROUP_ADMIN, BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import { Topics } from '../topics';
import { NotificationsService } from './notifications.service';

const postUsers = vi.fn();
const postSubscriptions = vi.fn();

vi.mock('@notifo/notifo', () => ({
  NotifoClient: class {
    users = { postUsers, postSubscriptions };
  },
}));

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    postUsers.mockReset();
    postSubscriptions.mockReset();

    const config = { get: () => ({ apiKey: 'key', apiUrl: 'https://notifo', appId: 'app' }) } as unknown as ConfigService;
    service = new NotificationsService(config);
  });

  it('should subscribe admins and unsubscribe other users from the admin topic', async () => {
    await service.upsertUsers([
      { id: 'admin', userGroupId: BUILTIN_USER_GROUP_ADMIN },
      { id: 'user', userGroupId: BUILTIN_USER_GROUP_DEFAULT },
    ]);

    expect(postSubscriptions).toHaveBeenCalledWith('app', 'admin', { subscribe: [{ topicPrefix: Topics.admins }] });
    expect(postSubscriptions).toHaveBeenCalledWith('app', 'user', { unsubscribe: [Topics.admins] });
  });

  it('should not touch the admin subscription when the user group is unknown', async () => {
    await service.upsertUsers([{ id: 'user' }]);

    expect(postSubscriptions).not.toHaveBeenCalled();
  });
});
