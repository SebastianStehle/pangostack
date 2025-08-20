import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Team } from '../interfaces';
import { buildTeam } from './utils';

type Values = Partial<Pick<Team, 'name'>>;

export class UpdateTeam extends Command<UpdateTeamResult> {
  constructor(
    public readonly teamId: number,
    public readonly values: Values,
  ) {
    super();
  }
}

export class UpdateTeamResult {
  constructor(public readonly team: Team) {}
}

@CommandHandler(UpdateTeam)
export class UpdateTeamHandler implements ICommandHandler<UpdateTeam, UpdateTeamResult> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
  ) {}

  async execute(request: UpdateTeam): Promise<UpdateTeamResult> {
    const { teamId, values } = request;
    const { name } = values;

    const team = await this.teams.findOne({ where: { id: teamId }, relations: ['users', 'users.user'] });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found.`);
    }

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(team, { name });
    await this.teams.save(team);

    return new UpdateTeamResult(buildTeam(team));
  }
}
