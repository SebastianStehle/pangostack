import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRepository } from 'src/domain/database';

export class DeleteUser {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteUser)
export class DeleteUserHandler implements ICommandHandler<DeleteUser, any> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(command: DeleteUser): Promise<any> {
    const { userId } = command;

    const { affected } = await this.users.delete({ id: userId });
    if (!affected) {
      throw new NotFoundException(`User ${userId} not found.`);
    }
  }
}
