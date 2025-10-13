import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { ServiceEntity, ServiceRepository, ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { ServicePublic } from '../interfaces';
import { buildServicePublic } from './utils';

export class GetServicesPublicQuery extends Query<GetServicesPublicResult> {
  constructor(public readonly publicOnly = true) {
    super();
  }
}

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

  async execute(query: GetServicesPublicQuery): Promise<GetServicesPublicResult> {
    const { publicOnly } = query;
    const where: FindOptionsWhere<ServiceEntity> = {};
    if (publicOnly) {
      where.isPublic = true;
    }

    const entities = await this.services.find({ where });
    const result: ServicePublic[] = [];

    for (const entity of entities) {
      const version = await this.serviceVersions.findOne({ where: { serviceId: entity.id }, order: { name: 'DESC' } });

      result.push(buildServicePublic(entity, version));
    }

    return new GetServicesPublicResult(result);
  }
}
