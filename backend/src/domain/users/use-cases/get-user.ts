import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRepository } from 'src/domain/database';
import { User } from '../interfaces';
import { buildUser } from './utils';

export class GetUserQuery extends Query<GetUserResult> {
  constructor(public readonly userId: string) {
    super();
  }
}

export class GetUserResult {
  constructor(public readonly user?: User | null) {}
}

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, GetUserResult> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    const { userId } = query;

    const user = await this.users.findOneBy({ id: userId });
    const result = user ? buildUser(user) : undefined;

    return new GetUserResult(result);
  }
}
