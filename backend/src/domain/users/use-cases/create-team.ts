import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Team } from '../interfaces';
import { buildTeam } from './utils';

type Values = Pick<Team, 'name'>;

export class CreateTeam {
  constructor(public readonly values: Values) {}
}

export class CreateTeamResponse {
  constructor(public readonly team: Team) {}
}

@CommandHandler(CreateTeam)
export class CreateTeamHandler implements ICommandHandler<CreateTeam, CreateTeamResponse> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
  ) {}

  async execute(request: CreateTeam): Promise<CreateTeamResponse> {
    const { values } = request;
    const { name } = values;

    const entity = this.teams.create();

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(entity, { name });

    // Use the save method otherwise we would not get previous values.
    const created = await this.teams.save(entity);
    const result = buildTeam(created);

    return new CreateTeamResponse(result);
  }
}
