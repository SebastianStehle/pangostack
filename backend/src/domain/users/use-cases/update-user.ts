import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { User } from '../interfaces';
import { buildUser } from './utils';

type Values = Partial<Pick<User, 'apiKey' | 'name' | 'email' | 'roles' | 'userGroupId'> & { password: string }>;

export class UpdateUser {
  constructor(
    public readonly id: string,
    public readonly values: Values,
  ) {}
}

export class UpdateUserResponse {
  constructor(public readonly user: User) {}
}

@CommandHandler(UpdateUser)
export class UpdateUserHandler implements ICommandHandler<UpdateUser, UpdateUserResponse> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(request: UpdateUser): Promise<UpdateUserResponse> {
    const { id, values } = request;
    const { apiKey, email, name, password, roles, userGroupId } = values;

    const user = await this.users.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found.`);
    }

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(user, { apiKey, email, name, roles, userGroupId });
    await this.users.save(user);

    return new UpdateUserResponse(buildUser(user));
  }
}
