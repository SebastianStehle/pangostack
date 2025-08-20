import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { ServiceVersion } from '../interfaces';
import { buildServiceVersion } from './utils';

export class GetServiceVersionsQuery extends Query<GetServiceVersionsResult> {
  constructor(public readonly serviceId: number) {
    super();
  }
}

export class GetServiceVersionsResult {
  constructor(public readonly serviceVersions: ServiceVersion[]) {}
}

@QueryHandler(GetServiceVersionsQuery)
export class GetServiceVersionsHandler implements IQueryHandler<GetServiceVersionsQuery, GetServiceVersionsResult> {
  constructor(
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(query: GetServiceVersionsQuery): Promise<GetServiceVersionsResult> {
    const { serviceId } = query;

    const entities = await this.serviceVersions.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
      relations: ['deploymentUpdates'],
    });

    const active = entities.find((x) => x.isActive);
    const result = entities.map((x) => buildServiceVersion(x, x === active));

    return new GetServiceVersionsResult(result);
  }
}
