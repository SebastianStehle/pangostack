import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRepository } from 'src/domain/database';
import { User } from '../interfaces';
import { buildUser } from './utils';

type Values = Pick<User, 'apiKey' | 'email' | 'name' | 'roles' | 'userGroupId'> & { password?: string };

export class CreateUser extends Command<CreateUserResult> {
  constructor(public readonly values: Values) {
    super();
  }
}

export class CreateUserResult {
  constructor(public readonly user: User) {}
}

@CommandHandler(CreateUser)
export class CreateUserHandler implements ICommandHandler<CreateUser, CreateUserResult> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(request: CreateUser): Promise<CreateUserResult> {
    const { values } = request;
    const { apiKey, email, name, password, roles, userGroupId } = values;

    const user = this.users.create({
      apiKey,
      email,
      name,
      passwordHash: password ? await bcrypt.hash(password, 10) : null!,
      roles,
      userGroupId,
    });
    await this.users.save(user);

    return new CreateUserResult(buildUser(user));
  }
}
