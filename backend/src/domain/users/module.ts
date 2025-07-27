import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, UserGroupEntity } from 'src/domain/database';
import {
  CreateUserGroupHandler,
  CreateUserHandler,
  DeleteUserGroupHandler,
  DeleteUserHandler,
  GetUserGroupHandler,
  GetUserGroupsHandler,
  GetUserHandler,
  GetUsersHandler,
  UpdateUserGroupHandler,
  UpdateUserHandler,
} from './use-cases';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([UserEntity, UserGroupEntity])],
  providers: [
    CreateUserGroupHandler,
    CreateUserHandler,
    DeleteUserGroupHandler,
    DeleteUserHandler,
    GetUserGroupHandler,
    GetUserGroupsHandler,
    GetUserHandler,
    GetUsersHandler,
    UpdateUserGroupHandler,
    UpdateUserHandler,
  ],
})
export class UsersModule {}
