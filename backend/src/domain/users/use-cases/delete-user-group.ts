import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';

export class DeleteUserGroup {
  constructor(public readonly userGroupId: string) {}
}

@CommandHandler(DeleteUserGroup)
export class DeleteUserGroupHandler implements ICommandHandler<DeleteUserGroup, any> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(command: DeleteUserGroup): Promise<any> {
    const { userGroupId } = command;

    const userGroup = await this.userGroups.findOneBy({ id: userGroupId });
    if (!userGroup) {
      throw new NotFoundException(`User group ${userGroupId} not found.`);
    }

    if (userGroup.isBuiltIn) {
      throw new BadRequestException('Cannot delete builtin user group.');
    }

    const { affected } = await this.userGroups.delete({ id: userGroupId });
    if (!affected) {
      throw new NotFoundException(`User group ${userGroupId} not found.`);
    }
  }
}
