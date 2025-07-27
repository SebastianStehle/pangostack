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

    const entity = await this.userGroups.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`User group ${id} not found.`);
    }

    if (entity.isBuiltIn) {
      throw new BadRequestException('Cannot delete builtin user group.');
    }

    const result = await this.userGroups.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`User group ${id} not found.`);
    }
  }
}
