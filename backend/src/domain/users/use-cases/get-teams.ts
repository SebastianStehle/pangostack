import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { TeamEntity, TeamRepository, TeamUserEntity, TeamUserRepository } from 'src/domain/database';
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
    @InjectRepository(TeamUserEntity)
    private readonly teamUsers: TeamUserRepository,
  ) {}

  async execute(query: GetTeams): Promise<GetTeamsResponse> {
    const { user } = query;

    const teamUsers = await this.teamUsers.find({ where: { userId: user.id } });
    const teamIds = new Set<number>(teamUsers.map((x) => x.teamId));

    const teams = await this.teams.find({ where: { id: In([...teamIds]) }, relations: ['users', 'users.user'] });

    return new GetTeamsResponse(teams.map(buildTeam));
  }
}
