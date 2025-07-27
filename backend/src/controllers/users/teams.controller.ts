import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  DeleteTeamUser,
  DeleteTeamUserResponse,
  GetTeams,
  GetTeamsResponse,
  SetTeamUser,
  SetTeamUserResponse,
} from 'src/domain/users';
import { TeamDto, TeamsDto, UpsertTeamUserDto } from './dtos';

@Controller('teams')
@ApiTags('teams')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class TeamsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getTeams', description: 'Gets the teams.' })
  @ApiOkResponse({ type: TeamsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async getTeams() {
    const result: GetTeamsResponse = await this.queryBus.execute(new GetTeams());

    return TeamsDto.fromDomain(result.teams);
  }

  @Post(':teamId/users')
  @ApiOperation({ operationId: 'postTeamUser', description: 'Sets a team user.' })
  @ApiParam({
    name: 'teamId',
    description: 'The ID of the team.',
    required: true,
  })
  @ApiOkResponse({ type: TeamsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async postTeamUser(@Req() req: Request, @Param('teamId') teamId: string, @Body() body: UpsertTeamUserDto) {
    const command = new SetTeamUser(+teamId, body.userId, req.user, body.role);

    const result: SetTeamUserResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }

  @Delete(':teamId/users/:userId')
  @ApiParam({
    name: 'teamId',
    description: 'The ID of the team.',
    required: true,
  })
  @ApiOperation({ operationId: 'deleteTeamuser', description: 'Removes a team user.' })
  @ApiOkResponse({ type: TeamsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async deleteTeamUser(@Req() req: Request, @Param('teamId') teamId: string, @Param('userId') userId: string) {
    const command = new DeleteTeamUser(+teamId, userId, req.user);
    const result: DeleteTeamUserResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }
}
