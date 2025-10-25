import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity, TeamRepository, TeamUserEntity } from 'src/domain/database';
import { NotificationsService } from 'src/domain/notifications';
import { saveAndFind } from 'src/lib';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

type Values = Pick<Team, 'name'>;

export class CreateTeam extends Command<CreateTeamResult> {
  constructor(
    public readonly values: Values,
    public readonly user: User,
  ) {
    super();
  }
}

export class CreateTeamResult {
  constructor(public readonly team: Team) {}
}

@CommandHandler(CreateTeam)
export class CreateTeamHandler implements ICommandHandler<CreateTeam, CreateTeamResult> {
  constructor(
    private readonly notifications: NotificationsService,
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(TeamUserEntity)
    private readonly teamUsers: Repository<TeamUserEntity>,
  ) {}

  async execute(request: CreateTeam): Promise<CreateTeamResult> {
    const { values, user } = request;
    const { name } = values;

    const team = await saveAndFind(this.teams, { name });

    await saveAndFind(this.teamUsers, {
      team,
      teamId: team.id,
      role: 'Admin',
      user: undefined!,
      userId: user.id,
    });

    const withUsers = await this.teams.findOneOrFail({ where: { id: team.id }, relations: ['users', 'users.user'] });

    // This method will catch exceptions.
    await this.notifications.subscribe(user.id, `teams/${team.id}`);

    return new CreateTeamResult(buildTeam(withUsers));
  }
}
