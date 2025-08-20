import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';
import { CreateUserGroup, DeleteUserGroup, GetUserGroupsQuery, UpdateUserGroup } from 'src/domain/users';
import { UpsertUserGroupDto, UserGroupDto, UserGroupsDto } from './dtos';

@Controller('user-groups')
@ApiTags('users')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class UserGroupsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getUserGroups', description: 'Gets the user groups.' })
  @ApiOkResponse({ type: UserGroupsDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getUserGroups() {
    const { userGroups } = await this.queryBus.execute(new GetUserGroupsQuery());

    return UserGroupsDto.fromDomain(userGroups);
  }

  @Post('')
  @ApiOperation({ operationId: 'postUserGroup', description: 'Creates a user group.' })
  @ApiOkResponse({ type: UserGroupDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postUserGroup(@Body() body: UpsertUserGroupDto) {
    const command = new CreateUserGroup(body);
    const { userGroup } = await this.commandBus.execute(command);

    return UserGroupDto.fromDomain(userGroup);
  }

  @Put(':groupId')
  @ApiOperation({ operationId: 'putUserGroup', description: 'Updates the user group.' })
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the user group.',
    required: true,
  })
  @ApiOkResponse({ type: UserGroupDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putUser(@Param('groupId') groupId: string, @Body() body: UpsertUserGroupDto) {
    const command = new UpdateUserGroup(groupId, body);
    const { userGroup } = await this.commandBus.execute(command);

    return UserGroupDto.fromDomain(userGroup);
  }

  @Delete(':groupId')
  @ApiOperation({ operationId: 'deleteUserGroup', description: 'Deletes an user group.' })
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the user group.',
    required: true,
  })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async deleteUserGroup(@Param('groupId') groupId: string) {
    const command = new DeleteUserGroup(groupId);

    await this.commandBus.execute(command);
  }
}
