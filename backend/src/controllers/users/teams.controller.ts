import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_DEFAULT } from 'src/domain/database';
import {
  CreateTeam,
  CreateTeamResponse,
  DeleteTeamUser,
  DeleteTeamUserResponse,
  GetTeams,
  GetTeamsResponse,
  SetTeamUser,
  SetTeamUserResponse,
  UpdateTeam,
  UpdateTeamResponse,
} from 'src/domain/users';
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
    const result: GetTeamsResponse = await this.queryBus.execute(new GetTeams(req.user));

    return TeamsDto.fromDomain(result.teams);
  }

  @Post('')
  @ApiOperation({ operationId: 'postTeam', description: 'Creates a team.' })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async postTeam(@Req() req: Request, @Body() body: UpsertTeamDto) {
    const command = new CreateTeam(body, req.user);

    const result: CreateTeamResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }

  @Put(':teamId')
  @ApiOperation({ operationId: 'putTeam', description: 'Updates a team.' })
  @ApiParam({
    name: 'teamId',
    description: 'The ID of the team.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async putTeam(@Param('teamId', ParseIntPipe) teamId: number, @Body() body: UpsertTeamDto) {
    const command = new UpdateTeam(teamId, body);

    const result: UpdateTeamResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }

  @Post(':teamId/users')
  @ApiOperation({ operationId: 'postTeamUser', description: 'Sets a team user.' })
  @ApiParam({
    name: 'teamId',
    description: 'The ID of the team.',
    required: true,
    type: 'number',
  })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async postTeamUser(@Req() req: Request, @Param('teamId', ParseIntPipe) teamId: number, @Body() body: UpsertTeamUserDto) {
    const command = new SetTeamUser(teamId, body.userId, req.user, body.role);

    const result: SetTeamUserResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }

  @Delete(':teamId/users/:userId')
  @ApiParam({
    name: 'teamId',
    description: 'The ID of the team.',
    required: true,
    type: 'number',
  })
  @ApiOperation({ operationId: 'deleteTeamuser', description: 'Removes a team user.' })
  @ApiOkResponse({ type: TeamDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async deleteTeamUser(@Req() req: Request, @Param('teamId', ParseIntPipe) teamId: number, @Param('userId') userId: string) {
    const command = new DeleteTeamUser(teamId, userId, req.user);
    const result: DeleteTeamUserResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }
}
