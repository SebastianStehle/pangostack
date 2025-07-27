import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRepository } from 'src/domain/database';

export class DeleteUser {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUser)
export class DeleteUserHandler implements ICommandHandler<DeleteUser, any> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(command: DeleteUser): Promise<any> {
    const { id } = command;

    const result = await this.users.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`User ${id} not found.`);
    }
  }
}
