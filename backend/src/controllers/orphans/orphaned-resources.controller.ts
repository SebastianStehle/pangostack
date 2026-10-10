import { Body, Controller, Get, Param, ParseEnumPipe, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN, OrphanedResourceStatus } from 'src/domain/database';
import {
  GetOrphanedResourcesQuery,
  GetOrphanedResourcesResult,
  SetOrphanedResourceStatus,
  SetOrphanedResourceStatusResult,
} from 'src/domain/orphans';
import { ORPHANED_RESOURCE_STATUS, OrphanedResourceDto, OrphanedResourcesDto, SetOrphanedResourceStatusDto } from './dtos';

@Controller('api/orphaned-resources')
@ApiTags('orphaned-resources')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class OrphanedResourcesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getOrphanedResources', description: 'Gets the orphaned resources.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ORPHANED_RESOURCE_STATUS })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiOkResponse({ type: OrphanedResourcesDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getOrphanedResources(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('status', new ParseEnumPipe(ORPHANED_RESOURCE_STATUS, { optional: true })) status?: OrphanedResourceStatus,
    @Query('query') query?: string,
  ) {
    const { orphanedResources, total } = await this.queryBus.execute<GetOrphanedResourcesQuery, GetOrphanedResourcesResult>(
      new GetOrphanedResourcesQuery(page, pageSize, status, query),
    );

    return OrphanedResourcesDto.fromDomain(orphanedResources, total);
  }

  @Post(':id/status')
  @ApiOperation({ operationId: 'postOrphanedResourceStatus', description: 'Updates the status.' })
  @ApiOkResponse({ type: OrphanedResourceDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postOrphanedResourceStatus(@Param('id', ParseIntPipe) id: number, @Body() body: SetOrphanedResourceStatusDto) {
    const { orphanedResource } = await this.commandBus.execute<SetOrphanedResourceStatus, SetOrphanedResourceStatusResult>(
      new SetOrphanedResourceStatus(id, body.status),
    );

    return OrphanedResourceDto.fromDomain(orphanedResource);
  }
}
