import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { UserGroup } from '../interfaces';
import { buildUserGroup } from './utils';

type Values = Partial<Pick<UserGroup, 'name'>>;

export class UpdateUserGroup extends Command<UpdateUserGroupResult> {
  constructor(
    public readonly userId: string,
    public readonly values: Values,
  ) {
    super();
  }
}

export class UpdateUserGroupResult {
  constructor(public readonly userGroup: UserGroup) {}
}

@CommandHandler(UpdateUserGroup)
export class UpdateUserGroupHandler implements ICommandHandler<UpdateUserGroup, UpdateUserGroupResult> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(request: UpdateUserGroup): Promise<UpdateUserGroupResult> {
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

    return new UpdateUserGroupResult(buildUserGroup(userGroup));
  }
}
