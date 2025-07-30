import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { ServiceVersion } from '../interfaces';
import { buildServiceVersion } from './utils';

export class GetServiceVersions {
  constructor(public readonly serviceId: number) {}
}

export class GetServiceVersionsResponse {
  constructor(public readonly serviceVersions: ServiceVersion[]) {}
}

@QueryHandler(GetServiceVersions)
export class GetServiceVersionsHandler implements IQueryHandler<GetServiceVersions, GetServiceVersionsResponse> {
  constructor(
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(query: GetServiceVersions): Promise<GetServiceVersionsResponse> {
    const { serviceId } = query;

    const entities = await this.serviceVersions.find({
      where: { serviceId },
      order: { createdAt: 'DESC' },
      relations: ['deploymentUpdates'],
    });

    const active = entities.find((x) => x.isActive);
    const result = entities.map((x) => buildServiceVersion(x, x === active));

    return new GetServiceVersionsResponse(result);
  }
}
