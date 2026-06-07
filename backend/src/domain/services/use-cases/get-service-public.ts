import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { ServiceEntity, ServiceRepository, ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { ServicePublic } from '../interfaces';
import { buildServicePublic } from './utils';

export class GetServicePublicQuery extends Query<GetServicePublicResult> {
  constructor(
    public readonly serviceId: number,
    public readonly versionName?: string,
    public readonly publicOnly = true,
  ) {
    super();
  }
}

export class GetServicePublicResult {
  constructor(public readonly service?: ServicePublic) {}
}

@QueryHandler(GetServicePublicQuery)
export class GetServicePublicHandler implements IQueryHandler<GetServicePublicQuery, GetServicePublicResult> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(query: GetServicePublicQuery): Promise<GetServicePublicResult> {
    const { serviceId, versionName, publicOnly } = query;
    const where: FindOptionsWhere<ServiceEntity> = { id: serviceId };
    if (publicOnly) {
      where.isPublic = true;
    }

    const entity = await this.services.findOne({ where });
    if (!entity) {
      return new GetServicePublicResult();
    }

    const versionQuery: FindOptionsWhere<ServiceVersionEntity> = { serviceId: entity.id, isActive: true };
    if (versionName) {
      versionQuery.name = versionName;
    }

    const version = await this.serviceVersions.findOne({ where: versionQuery, order: { name: 'DESC' } });
    if (!version) {
      return new GetServicePublicResult();
    }

    return new GetServicePublicResult(buildServicePublic(entity, version));
  }
}
