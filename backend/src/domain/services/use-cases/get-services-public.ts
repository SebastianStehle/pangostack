import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { ServicePublic } from '../interfaces';
import { parseDefinition } from '../workflows/model';
import { buildServicePublic } from './utils';

export class GetServicesPublic {
  constructor() {}
}

export class GetServicesPublicResponse {
  constructor(public readonly services: ServicePublic[]) {}
}

@QueryHandler(GetServicesPublic)
export class GetServicesPublicHandler implements IQueryHandler<GetServicesPublic, GetServicesPublicResponse> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(): Promise<GetServicesPublicResponse> {
    const entities = await this.services.find({ relations: ['versions'] });
    const result: ServicePublic[] = [];

    for (const entity of entities) {
      const version = entity.versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).find((x) => x.isActive);
      if (!version) {
        continue;
      }

      const definition = parseDefinition(version.definition);
      if (!definition?.parameters || !definition?.usage) {
        continue;
      }

      result.push(buildServicePublic(entity, version, definition));
    }

    return new GetServicesPublicResponse(result);
  }
}
