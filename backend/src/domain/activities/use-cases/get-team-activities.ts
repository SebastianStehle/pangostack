import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamActivityEntity, TeamActivityRepository } from 'src/domain/database';
import { TeamActivity } from '../interfaces';
import { ACTIVITY_TEXTS, ActivityKey } from '../texts';

const DEFAULT_PAGE_SIZE = 20;

export class GetTeamActivitiesQuery extends Query<GetTeamActivitiesResult> {
  constructor(
    public readonly teamId: number,
    public readonly page = 0,
    public readonly pageSize = DEFAULT_PAGE_SIZE,
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
  ) {}

  async execute(query: GetTeamActivitiesQuery): Promise<GetTeamActivitiesResult> {
    const { teamId, page, pageSize } = query;

    const [entities, total] = await this.activities.findAndCount({
      where: { teamId },
      order: { createdAt: 'DESC', id: 'DESC' },
      skip: page * pageSize,
      take: pageSize,
    });

    const activities = entities.map(({ id, teamId, key, parameters, createdAt, createdBy }) => ({
      id,
      teamId,
      key,
      text: this.renderText(key, parameters),
      createdAt,
      createdBy,
    }));

    return new GetTeamActivitiesResult(activities, total);
  }

  private renderText(key: string, event: Record<string, unknown>): string {
    const render = ACTIVITY_TEXTS[key as ActivityKey];

    // Fall back to the raw key for activities that are no longer defined, so nothing crashes.
    return render ? render(event as never) : key;
  }
}
