import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Raw } from 'typeorm';
import { UserEntity, UserRepository } from 'src/domain/database';
import { User } from '../interfaces';
import { buildUser } from './utils';

export class GetUsersQuery extends Query<GetUsersResult> {
  constructor(
    public readonly page = 0,
    public readonly pageSize = 10,
    public readonly query?: string,
  ) {
    super();
  }
}

export class GetUsersResult {
  constructor(
    public readonly users: User[],
    public readonly total: number,
  ) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, GetUsersResult> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: UserRepository,
  ) {}

  async execute(query: GetUsersQuery): Promise<GetUsersResult> {
    const { page, pageSize, query: searchQuery } = query;

    const where: FindOptionsWhere<UserEntity> = {};

    if (searchQuery && searchQuery != '') {
      where.name = Raw((alias) => `LOWER(${alias}) Like '%${searchQuery.toLowerCase()}%'`);
    }

    const options: FindManyOptions<UserEntity> = { where };
    const total = await this.users.count(options);

    options.skip = pageSize * page;
    options.take = pageSize;

    const entities = await this.users.find(options);
    const result = entities.map(buildUser);

    return new GetUsersResult(result, total);
  }
}
