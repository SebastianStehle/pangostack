import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';
import { UserGroup } from '../interfaces';
import { buildUserGroup } from './utils';

type Values = Pick<UserGroup, 'name'>;

export class CreateUserGroup extends Command<CreateUserGroupResult> {
  constructor(public readonly values: Values) {
    super();
  }
}

export class CreateUserGroupResult {
  constructor(public readonly userGroup: UserGroup) {}
}

@CommandHandler(CreateUserGroup)
export class CreateUserGroupHandler implements ICommandHandler<CreateUserGroup, CreateUserGroupResult> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(request: CreateUserGroup): Promise<CreateUserGroupResult> {
    const { values } = request;
    const { name } = values;

    const userGroup = await saveAndFind(this.userGroups, { name });

    return new CreateUserGroupResult(buildUserGroup(userGroup));
  }
}
