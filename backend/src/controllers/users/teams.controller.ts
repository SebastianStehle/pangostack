import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import { CreateTeam, DeleteTeamUser, GetTeamsQuery, SetTeamUser, UpdateTeam } from 'src/domain/users';
import { IntParam } from 'src/lib';
import { TeamDto, TeamsDto, UpsertTeamDto, UpsertTeamUserDto } from './dtos';

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
  async getTeams(@Req() req: Request) {
    const { teams } = await this.queryBus.execute(new GetTeamsQuery(req.user));

    return TeamsDto.fromDomain(teams);
  }

  @Post('')
  @ApiOperation({ operationId: 'postTeam', description: 'Creates a team.' })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async postTeam(@Req() req: Request, @Body() body: UpsertTeamDto) {
    const command = new CreateTeam(body, req.user);
    const { team } = await this.commandBus.execute(command);

    return TeamDto.fromDomain(team);
  }

  @Put(':teamId')
  @ApiOperation({ operationId: 'putTeam', description: 'Updates a team.' })
  @ApiParam({ name: 'teamId', description: 'The ID of the team.', required: true, type: 'number' })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async putTeam(@IntParam('teamId') teamId: number, @Body() body: UpsertTeamDto) {
    const command = new UpdateTeam(teamId, body);
    const { team } = await this.commandBus.execute(command);

    return TeamDto.fromDomain(team);
  }

  @Post(':teamId/users')
  @ApiOperation({ operationId: 'postTeamUser', description: 'Sets a team user.' })
  @ApiParam({ name: 'teamId', description: 'The ID of the team.', required: true, type: 'number' })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async postTeamUser(@Req() req: Request, @IntParam('teamId') teamId: number, @Body() body: UpsertTeamUserDto) {
    const command = new SetTeamUser(teamId, body.userIdOrEmail, req.user, body.role);
    const { team } = await this.commandBus.execute(command);

    return TeamDto.fromDomain(team);
  }

  @Delete(':teamId/users/:userId')
  @ApiParam({ name: 'teamId', description: 'The ID of the team.', required: true, type: 'number' })
  @ApiOperation({ operationId: 'deleteTeamuser', description: 'Removes a team user.' })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async deleteTeamUser(@Req() req: Request, @IntParam('teamId') teamId: number, @Param('userId') userId: string) {
    const command = new DeleteTeamUser(teamId, userId, req.user);
    const { team } = await this.commandBus.execute(command);

    return TeamDto.fromDomain(team);
  }
}
