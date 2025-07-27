import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { Service } from '../interfaces';
import { buildService } from './utils';

export class GetServices {
  constructor() {}
}

export class GetServicesResponse {
  constructor(public readonly services: Service[]) {}
}

@QueryHandler(GetServices)
export class GetServicesHandler implements IQueryHandler<GetServices, GetServicesResponse> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(): Promise<GetServicesResponse> {
    const entities = await this.services.find({ relations: ['versions', 'versions.deploymentUpdates'] });
    const result = entities.map(buildService);

    return new GetServicesResponse(result);
  }
}
