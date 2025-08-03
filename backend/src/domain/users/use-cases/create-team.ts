import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity, TeamRepository, TeamUserEntity } from 'src/domain/database';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

type Values = Pick<Team, 'name'>;

export class CreateTeam {
  constructor(
    public readonly values: Values,
    public readonly user: User,
  ) {}
}

export class CreateTeamResponse {
  constructor(public readonly team: Team) {}
}

@CommandHandler(CreateTeam)
export class CreateTeamHandler implements ICommandHandler<CreateTeam, CreateTeamResponse> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(TeamUserEntity)
    private readonly teamUsers: Repository<TeamUserEntity>,
  ) {}

  async execute(request: CreateTeam): Promise<CreateTeamResponse> {
    const { values, user } = request;
    const { name } = values;

    const team = await this.teams.save({ name });

    await this.teamUsers.save({
      team,
      teamId: team.id,
      role: 'default',
      user: undefined!,
      userId: user.id,
    });

    const withUsers = await this.teams.findOne({ where: { id: team.id }, relations: ['users', 'users.user'] });

    return new CreateTeamResponse(buildTeam(withUsers));
  }
}
