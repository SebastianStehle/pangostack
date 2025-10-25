import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository, UserEntity, UserRepository } from 'src/domain/database';
import { Topics } from '../topics';
import { NotificationsService } from './notifications.service';

export class NotificationsSyncService implements OnApplicationBootstrap {
  constructor(
    private readonly notifications: NotificationsService,
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async onApplicationBootstrap() {
    const users = await this.users.find();
    await this.notifications.upsertUsers(users);

    const teams = await this.teams.find({ relations: ['users'] });
    for (const team of teams) {
      const topic = Topics.team(team.id);
      for (const user of users) {
        await this.notifications.subscribe(user.id, topic);
      }
    }
  }
}
