import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In } from 'typeorm';
import { TeamActivityEntity, TeamActivityRepository, UserEntity, UserRepository } from 'src/domain/database';
import { getPagination } from 'src/lib';
import { TeamActivity, TeamActivityUser } from '../interfaces';
import { ACTIVITY_TEXTS, ActivityKey } from '../texts';

const DEFAULT_PAGE_SIZE = 20;

export class GetTeamActivitiesQuery extends Query<GetTeamActivitiesResult> {
  constructor(
    public readonly teamId: number,
    public readonly page = 0,
    public readonly pageSize = DEFAULT_PAGE_SIZE,
    public readonly deploymentId?: number,
  ) {
    super();
  }
}

export class GetTeamActivitiesResult {
  constructor(
    public readonly activities: TeamActivity[],
    public readonly total: number,
  ) {}
}

@QueryHandler(GetTeamActivitiesQuery)
export class GetTeamActivitiesHandler implements IQueryHandler<GetTeamActivitiesQuery, GetTeamActivitiesResult> {
  constructor(
    @InjectRepository(TeamActivityEntity)
    private readonly activities: TeamActivityRepository,
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(query: GetTeamActivitiesQuery): Promise<GetTeamActivitiesResult> {
    const { teamId, page, pageSize, deploymentId } = query;
    const { skip, take } = getPagination(page, pageSize);

    const where: FindOptionsWhere<TeamActivityEntity> = { teamId };
    if (deploymentId) {
      where.deploymentId = deploymentId;
    }

    const [entities, total] = await this.activities.findAndCount({
      where,
      order: { createdAt: 'DESC', id: 'DESC' },
      skip,
      take,
    });

    const usersById = await this.resolveUsers(entities);

    const activities = entities.map(({ id, teamId, key, parameters, deploymentId, createdAt, createdBy }) => ({
      id,
      teamId,
      key,
      text: this.renderText(key, parameters),
      deploymentId,
      createdAt,
      // Resolve to the full user, or null for system activities and users that no longer exist.
      createdBy: createdBy ? (usersById.get(createdBy) ?? null) : null,
    }));

    return new GetTeamActivitiesResult(activities, total);
  }

  private async resolveUsers(entities: TeamActivityEntity[]): Promise<Map<string, TeamActivityUser>> {
    const userIds = [...new Set(entities.map((x) => x.createdBy).filter((x): x is string => !!x))];

    const usersById = new Map<string, TeamActivityUser>();
    if (userIds.length === 0) {
      return usersById;
    }

    const users = await this.users.find({ where: { id: In(userIds) } });

    for (const { id, name, email } of users) {
      usersById.set(id, { id, name, email });
    }

    return usersById;
  }

  private renderText(key: string, event: Record<string, unknown>): string {
    const render = ACTIVITY_TEXTS[key as ActivityKey];

    // Fall back to the raw key for activities that are no longer defined, so nothing crashes.
    return render ? render(event as never) : key;
  }
}
