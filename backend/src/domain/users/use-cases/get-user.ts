import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRepository } from 'src/domain/database';
import { User } from '../interfaces';
import { buildUser } from './utils';

export class GetUser {
  constructor(public readonly userId: string) {}
}

export class GetUserResponse {
  constructor(public readonly user?: User) {}
}

@QueryHandler(GetUser)
export class GetUserHandler implements IQueryHandler<GetUser, GetUserResponse> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(query: GetUser): Promise<GetUserResponse> {
    const { userId } = query;

    const user = await this.users.findOneBy({ id: userId });
    const result = user ? buildUser(user) : undefined;

    return new GetUserResponse(result);
  }
}
