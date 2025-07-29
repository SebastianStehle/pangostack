import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity, TeamRepository, TeamUserEntity } from 'src/domain/database';
import { assignDefined } from 'src/lib';
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

    const entity = this.teams.create();

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(entity, { name });

    // Use the save method otherwise we would not get previous values.
    const created = await this.teams.save(entity);
    const teamUser = this.teamUsers.create();
    teamUser.user = undefined!;
    teamUser.userId = user.id;
    teamUser.team = created;
    teamUser.teamId = created.id;
    teamUser.role = 'default';
    await this.teamUsers.save(teamUser);

    // Reload the team to ge tupdates relations.
    const updated = await this.teams.findOne({ where: { id: created.id }, relations: ['users', 'users.user'] });
    const result = buildTeam(updated);

    return new CreateTeamResponse(result);
  }
}
