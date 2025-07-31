import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';
import { UserGroup } from '../interfaces';
import { buildUserGroup } from './utils';

export class GetUserGroup {
  constructor(public readonly id: string) {}
}

export class GetUserGroupResponse {
  constructor(public readonly userGroup?: UserGroup) {}
}

@QueryHandler(GetUserGroup)
export class GetUserGroupHandler implements IQueryHandler<GetUserGroup, GetUserGroupResponse> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(request: GetUserGroup): Promise<GetUserGroupResponse> {
    const { id } = request;

    const userGroup = await this.userGroups.findOneBy({ id });
    const result = userGroup ? buildUserGroup(userGroup) : undefined;

    return new GetUserGroupResponse(result);
  }
}
