import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository, ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { ServiceVersion } from '../interfaces';
import { buildServiceVersion } from './utils';

type Values = Omit<ServiceVersion, 'id' | 'isDefault' | 'lastestVersion' | 'numDeployments'>;

export class CreateServiceVersion {
  constructor(
    public readonly serviceId: number,
    public readonly values: Values,
  ) {}
}

export class CreateServiceVersionResponse {
  constructor(public readonly serviceVersion: ServiceVersion) {}
}

@CommandHandler(CreateServiceVersion)
export class CreateServiceVersionHandler implements ICommandHandler<CreateServiceVersion, CreateServiceVersionResponse> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(request: CreateServiceVersion): Promise<CreateServiceVersionResponse> {
    const { serviceId, values } = request;
    const { definition, environment, isActive, name } = values;

    const service = await this.services.findOneBy({ id: serviceId });
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found.`);
    }

    const serviceVersion = this.serviceVersions.create();

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(serviceVersion, { definition, environment, isActive, name, serviceId });

    // Use the save method otherwise we would not get previous values.
    const created = await this.serviceVersions.save(serviceVersion);
    const result = buildServiceVersion(created, false);

    return new CreateServiceVersionResponse(result);
  }
}
