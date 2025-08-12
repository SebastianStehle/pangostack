import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity, TeamUserEntity, UserEntity, UserGroupEntity } from 'src/domain/database';
import {
  CreateTeamHandler,
  CreateUserGroupHandler,
  CreateUserHandler,
  DeleteTeamUserHandler,
  DeleteUserGroupHandler,
  DeleteUserHandler,
  GetTeamsHandler,
  GetUserGroupHandler,
  GetUserGroupsHandler,
  GetUserHandler,
  GetUsersHandler,
  SetTeamUserHandler,
  UpdateUserGroupHandler,
  UpdateUserHandler,
} from './use-cases';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([TeamEntity, TeamUserEntity, UserEntity, UserGroupEntity])],
  providers: [
    CreateTeamHandler,
    CreateUserGroupHandler,
    CreateUserHandler,
    DeleteTeamUserHandler,
    DeleteUserGroupHandler,
    DeleteUserHandler,
    GetTeamsHandler,
    GetUserGroupHandler,
    GetUserGroupsHandler,
    GetUserHandler,
    GetUsersHandler,
    SetTeamUserHandler,
    UpdateUserGroupHandler,
    UpdateUserHandler,
  ],
})
export class UsersModule {}
