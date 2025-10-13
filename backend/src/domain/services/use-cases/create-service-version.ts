import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository, ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';
import { ServiceVersion } from '../interfaces';
import { buildServiceVersion } from './utils';

type Values = Omit<ServiceVersion, 'id' | 'isDefault' | 'lastestVersion' | 'numDeployments'>;

export class CreateServiceVersion extends Command<CreateServiceVersionResult> {
  constructor(
    public readonly serviceId: number,
    public readonly values: Values,
  ) {
    super();
  }
}

export class CreateServiceVersionResult {
  constructor(public readonly serviceVersion: ServiceVersion) {}
}

@CommandHandler(CreateServiceVersion)
export class CreateServiceVersionHandler implements ICommandHandler<CreateServiceVersion, CreateServiceVersionResult> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(request: CreateServiceVersion): Promise<CreateServiceVersionResult> {
    const { serviceId, values } = request;
    const { definition, definitionSource, environment, isActive, name } = values;

    const service = await this.services.findOneBy({ id: serviceId });
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found.`);
    }

    const version = await saveAndFind(this.serviceVersions, {
      definition,
      definitionSource,
      environment,
      isActive,
      name,
      serviceId,
    });

    return new CreateServiceVersionResult(buildServiceVersion(version, false));
  }
}
