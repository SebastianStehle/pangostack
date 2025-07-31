import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity, UserGroupRepository } from 'src/domain/database';

export class DeleteUserGroup {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserGroup)
export class DeleteUserGroupHandler implements ICommandHandler<DeleteUserGroup, any> {
  constructor(
    @InjectRepository(UserGroupEntity)
    private readonly userGroups: UserGroupRepository,
  ) {}

  async execute(command: DeleteUserGroup): Promise<any> {
    const { id } = command;

    const userGroup = await this.userGroups.findOneBy({ id });
    if (!userGroup) {
      throw new NotFoundException(`User group ${id} not found.`);
    }

    if (userGroup.isBuiltIn) {
      throw new BadRequestException('Cannot delete builtin user group.');
    }

    const { affected } = await this.userGroups.delete({ id });
    if (!affected) {
      throw new NotFoundException(`User group ${id} not found.`);
    }
  }
}
