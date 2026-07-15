import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetTeamActivitiesQuery } from 'src/domain/activities';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import { IntParam, IntQuery } from 'src/lib';
import { TeamPermissionGuard } from '../TeamPermissionGuard';
import { ActivitiesDto } from './dtos';

const DEFAULT_PAGE_SIZE = 20;

@Controller('api/teams/:teamId/activities')
@ApiParam({
  name: 'teamId',
  description: 'The ID of the team.',
  required: true,
  type: 'number',
})
@ApiTags('activities')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class TeamActivitiesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @ApiOperation({ operationId: 'getTeamActivities', description: 'Gets the team activity log.' })
  @ApiQuery({ name: 'page', description: 'The page number, starting at zero.', required: false, type: 'number' })
  @ApiQuery({ name: 'pageSize', description: 'The number of items per page.', required: false, type: 'number' })
  @ApiOkResponse({ type: ActivitiesDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard, TeamPermissionGuard)
  async getTeamActivities(
    @IntParam('teamId') teamId: number,
    @IntQuery('page', 0) page: number,
    @IntQuery('pageSize', DEFAULT_PAGE_SIZE) pageSize: number,
  ) {
    const { activities, total } = await this.queryBus.execute(new GetTeamActivitiesQuery(teamId, page, pageSize));

    return ActivitiesDto.fromDomain(activities, total);
  }
}
