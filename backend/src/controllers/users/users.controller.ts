import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';
import { CreateUser, DeleteUser, GetUserQuery, GetUsersQuery, UpdateUser } from 'src/domain/users';
import { IntQuery } from 'src/lib';
import { UpsertUserDto, UserDto, UsersDto } from './dtos';

@Controller('api/users')
@ApiTags('users')
@ApiSecurity('x-api-key')
@UseGuards(LocalAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('')
  @ApiOperation({ operationId: 'getUsers', description: 'Gets the users.' })
  @ApiOkResponse({ type: UsersDto })
  @ApiQuery({
    name: 'query',
    description: 'The query to search by email address.',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    description: 'The page count.',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'The page size.',
    required: false,
    type: Number,
  })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getUsers(@IntQuery('page') page: number, @IntQuery('pageSize', 20) pageSize: number, @Query('query') query?: string) {
    const { users, total } = await this.queryBus.execute(new GetUsersQuery(page, pageSize, query));

    return UsersDto.fromDomain(users, total);
  }

  @Get(':userId')
  @ApiOperation({ operationId: 'getUser', description: 'Get the user.' })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user.',
    required: true,
  })
  @ApiOkResponse({ type: UserDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async getUser(@Param('userId') userId: string) {
    const { user } = await this.queryBus.execute(new GetUserQuery(userId));

    if (!user) {
      throw new NotFoundException(`User ${userId} not found.`);
    }

    return UserDto.fromDomain(user);
  }

  @Post('')
  @ApiOperation({ operationId: 'postUser', description: 'Creates a user.' })
  @ApiOkResponse({ type: UserDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async postUser(@Body() body: UpsertUserDto) {
    const command = new CreateUser(body as any);
    const { user } = await this.commandBus.execute(command);

    return UserDto.fromDomain(user);
  }

  @Put(':userId')
  @ApiOperation({ operationId: 'putUser', description: 'Updates the user.' })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user.',
    required: true,
  })
  @ApiOkResponse({ type: UserDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async putUser(@Param('userId') userId: string, @Body() body: UpsertUserDto) {
    const command = new UpdateUser(userId, body);
    const { user } = await this.commandBus.execute(command);

    return UserDto.fromDomain(user);
  }

  @Delete(':userId')
  @ApiOperation({ operationId: 'deleteUser', description: 'Deletes an user.' })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user.',
    required: true,
  })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(RoleGuard)
  async deleteUser(@Param('userId') userId: string) {
    const command = new DeleteUser(userId);

    await this.commandBus.execute(command);
  }
}
