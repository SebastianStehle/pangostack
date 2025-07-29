import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamEntity, TeamRepository } from 'src/domain/database';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

export class GetTeams {
  constructor(public readonly user: User) {}
}

export class GetTeamsResponse {
  constructor(public readonly teams: Team[]) {}
}

@QueryHandler(GetTeams)
export class GetTeamsHandler implements IQueryHandler<GetTeams, GetTeamsResponse> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
  ) {}

  async execute(query: GetTeams): Promise<GetTeamsResponse> {
    const { user } = query;

    const entities = await this.teams
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.users', 'teamUser')
      .leftJoinAndSelect('teamUser.user', 'user')
      .where('teamUser.userId = :userId', { userId: user.id })
      .getMany();
    const result = entities.map(buildTeam);

    return new GetTeamsResponse(result);
  }
}
