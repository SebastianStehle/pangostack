import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';
import { UserGroup } from '../interfaces';
import { buildUserGroup } from './utils';

export class GetUserGroupQuery extends Query<GetUserGroupResult> {
  constructor(public readonly userId: string) {
    super();
  }
}

export class GetUserGroupResult {
  constructor(public readonly userGroup?: UserGroup | null) {}
}

@QueryHandler(GetUserGroupQuery)
export class GetUserGroupHandler implements IQueryHandler<GetUserGroupQuery, GetUserGroupResult> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(request: GetUserGroupQuery): Promise<GetUserGroupResult> {
    const { userId } = request;

    const userGroup = await this.userGroups.findOneBy({ id: userId });
    const result = userGroup ? buildUserGroup(userGroup) : undefined;

    return new GetUserGroupResult(result);
  }
}
