import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { UserGroup } from '../interfaces';
import { buildUserGroup } from './utils';

type Values = Partial<Pick<UserGroup, 'name'>>;

export class UpdateUserGroup {
  constructor(
    public readonly userId: string,
    public readonly values: Values,
  ) {}
}

export class UpdateUserGroupResponse {
  constructor(public readonly userGroup: UserGroup) {}
}

@CommandHandler(UpdateUserGroup)
export class UpdateUserGroupHandler implements ICommandHandler<UpdateUserGroup, UpdateUserGroupResponse> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(request: UpdateUserGroup): Promise<UpdateUserGroupResponse> {
    const { userId, values } = request;
    const { name } = values;

    const userGroup = await this.userGroups.findOneBy({ id: userId });
    if (!userGroup) {
      throw new NotFoundException(`User group ${userId} not found.`);
    }

    if (userGroup.isBuiltIn) {
      throw new BadRequestException('Cannot update builtin user group.');
    }

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(userGroup, { name });
    await this.userGroups.save(userGroup);

    return new UpdateUserGroupResponse(buildUserGroup(userGroup));
  }
}
