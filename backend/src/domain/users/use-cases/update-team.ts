import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Team } from '../interfaces';
import { buildTeam } from './utils';

type Values = Partial<Pick<Team, 'name'>>;

export class UpdateTeam {
  constructor(
    public readonly id: number,
    public readonly values: Values,
  ) {}
}

export class UpdateTeamResponse {
  constructor(public readonly team: Team) {}
}

@CommandHandler(UpdateTeam)
export class UpdateTeamHandler implements ICommandHandler<UpdateTeam, UpdateTeamResponse> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
  ) {}

  async execute(request: UpdateTeam): Promise<UpdateTeamResponse> {
    const { id, values } = request;
    const { name } = values;

    const entity = await this.teams.findOne({ where: { id }, relations: ['users', 'users.user'] });
    if (!entity) {
      throw new NotFoundException(`Team ${id} not found.`);
    }

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(entity, { name });

    // Use the save method otherwise we would not get previous values.
    const updated = await this.teams.save(entity);
    const result = buildTeam(updated);

    return new UpdateTeamResponse(result);
  }
}
