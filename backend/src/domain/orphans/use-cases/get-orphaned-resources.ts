import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, Raw } from 'typeorm';
import { OrphanedResourceEntity, OrphanedResourceRepository, OrphanedResourceStatus } from 'src/domain/database';
import { getPagination } from 'src/lib';
import { OrphanedResource } from '../interfaces';
import { buildOrphanedResource } from './utils';

export class GetOrphanedResourcesQuery extends Query<GetOrphanedResourcesResult> {
  constructor(
    public readonly page = 0,
    public readonly pageSize = 20,
    public readonly status?: OrphanedResourceStatus,
    public readonly query?: string,
  ) {
    super();
  }
}

export class GetOrphanedResourcesResult {
  constructor(
    public readonly orphanedResources: OrphanedResource[],
    public readonly total: number,
  ) {}
}

@QueryHandler(GetOrphanedResourcesQuery)
export class GetOrphanedResourcesHandler implements IQueryHandler<GetOrphanedResourcesQuery, GetOrphanedResourcesResult> {
  constructor(
    @InjectRepository(OrphanedResourceEntity)
    private readonly orphanedResources: OrphanedResourceRepository,
  ) {}

  async execute(request: GetOrphanedResourcesQuery): Promise<GetOrphanedResourcesResult> {
    const { page, pageSize, query: searchQuery, status } = request;

    const where: FindOptionsWhere<OrphanedResourceEntity> = {};

    // The list can get long, therefore resolved findings are filtered away in the database.
    if (status) {
      where.status = status;
    }

    if (searchQuery && searchQuery !== '') {
      where.resourceUniqueId = Raw((alias) => `LOWER(${alias}) LIKE :search`, {
        search: `%${searchQuery.toLowerCase()}%`,
      });
    }

    const options: FindManyOptions<OrphanedResourceEntity> = { where };
    const total = await this.orphanedResources.count(options);

    const { skip, take } = getPagination(page, pageSize);
    options.skip = skip;
    options.take = take;
    options.order = { lastSeenAt: 'DESC', id: 'DESC' };

    const entities = await this.orphanedResources.find(options);
    const result = entities.map(buildOrphanedResource);

    return new GetOrphanedResourcesResult(result, total);
  }
}
