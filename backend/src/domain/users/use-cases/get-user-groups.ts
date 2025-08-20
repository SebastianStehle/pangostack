import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';
import { UserGroup } from '../interfaces';
import { buildUserGroup } from './utils';

export class GetUserGroupsQuery {}

export class GetUserGroupsResponse {
  constructor(public readonly userGroups: UserGroup[]) {}
}

@QueryHandler(GetUserGroupsQuery)
export class GetUserGroupsHandler implements IQueryHandler<GetUserGroupsQuery, GetUserGroupsResponse> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(): Promise<GetUserGroupsResponse> {
    const userGroup = await this.userGroups.find();
    const result = userGroup.map(buildUserGroup);

    return new GetUserGroupsResponse(result);
  }
}
