import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { TeamEntity, TeamRepository, TeamUserEntity, TeamUserRepository } from 'src/domain/database';
import { Team, User } from '../interfaces';
import { buildTeam } from './utils';

export class GetTeamsQuery extends Query<GetTeamsResult> {
  constructor(public readonly user: User) {
    super();
  }
}

export class GetTeamsResult {
  constructor(public readonly teams: Team[]) {}
}

@QueryHandler(GetTeamsQuery)
export class GetTeamsHandler implements IQueryHandler<GetTeamsQuery, GetTeamsResult> {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: TeamRepository,
    @InjectRepository(TeamUserEntity)
    private readonly teamUsers: TeamUserRepository,
  ) {}

  async execute(query: GetTeamsQuery): Promise<GetTeamsResult> {
    const { user } = query;

    const teamUsers = await this.teamUsers.find({ where: { userId: user.id } });
    const teamIds = new Set<number>(teamUsers.map((x) => x.teamId));

    const teams = await this.teams.find({ where: { id: In([...teamIds]) }, relations: ['users', 'users.user'] });

    return new GetTeamsResult(teams.map(buildTeam));
  }
}
