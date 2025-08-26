import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository, ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
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
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(): Promise<GetServicesPublicResult> {
    const entities = await this.services.find({ where: { isPublic: true } });
    const result: ServicePublic[] = [];

    for (const entity of entities) {
      const version = await this.serviceVersions.findOne({ where: { serviceId: entity.id }, order: { createdAt: 'DESC' } });

      result.push(buildServicePublic(entity, version));
    }

    return new GetServicesPublicResult(result);
  }
}
