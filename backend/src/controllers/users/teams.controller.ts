import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Post(':id/users')
  @ApiOperation({ operationId: 'postTeamUser', description: 'Sets a team user.' })
  @ApiOkResponse({ type: TeamsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async postTeamUser(@Req() req: Request, @Param('id') id: string, @Body() body: UpsertTeamUserDto) {
    const command = new SetTeamUser(+id, body.userId, req.user, body.role);

    const result: SetTeamUserResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }

  @Delete(':id/users/:userId')
  @ApiOperation({ operationId: 'deleteTeamuser', description: 'Removes a team user.' })
  @ApiOkResponse({ type: TeamsDto })
  @Role(BUILTIN_USER_GROUP_DEFAULT)
  @UseGuards(RoleGuard)
  async deleteTeamUser(@Req() req: Request, @Param('id') id: string, @Param('userId') userId: string) {
    const command = new DeleteTeamUser(+id, userId, req.user);
    const result: DeleteTeamUserResponse = await this.commandBus.execute(command);

    return TeamDto.fromDomain(result.team);
  }
}
