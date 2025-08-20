import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { ServicePublic } from '../interfaces';
import { buildServicePublic } from './utils';

export class GetServicesPublicQuery extends Query<GetServicesPublicResult> {}

export class GetServicesPublicResult {
  constructor(public readonly services: ServicePublic[]) {}
}

@QueryHandler(GetServicesPublicQuery)
export class GetServicesPublicHandler implements IQueryHandler<GetServicesPublicQuery, GetServicesPublicResult> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(): Promise<GetServicesPublicResult> {
    const entities = await this.services.find({ relations: ['versions'] });
    const result: ServicePublic[] = [];

    for (const entity of entities) {
      const version = entity.versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).find((x) => x.isActive);
      if (!version) {
        continue;
      }

      result.push(buildServicePublic(entity, version));
    }

    return new GetServicesPublicResult(result);
  }
}
