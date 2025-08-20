import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { Service } from '../interfaces';
import { buildService } from './utils';

export class GetServicesQuery extends Query<GetServicesResult> {}

export class GetServicesResult {
  constructor(public readonly services: Service[]) {}
}

@QueryHandler(GetServicesQuery)
export class GetServicesHandler implements IQueryHandler<GetServicesQuery, GetServicesResult> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(): Promise<GetServicesResult> {
    const entities = await this.services.find({ relations: ['versions', 'versions.deploymentUpdates'] });
    const result = entities.map(buildService);

    return new GetServicesResult(result);
  }
}
