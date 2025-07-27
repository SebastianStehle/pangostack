import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository } from 'src/domain/database';
import { Team } from '../interfaces';
import { buildTeam } from './utils';

export class GetTeams {}

export class GetTeamsResponse {
  constructor(public readonly teams: Team[]) {}
}

@QueryHandler(GetTeams)
export class GetTeamsHandler implements IQueryHandler<GetTeams, GetTeamsResponse> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
  ) {}

  async execute(): Promise<GetTeamsResponse> {
    const entities = await this.teams.find({ relations: ['users', 'users.user'] });
    const result = entities.map(buildTeam);

    return new GetTeamsResponse(result);
  }
}
