import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { assignDefined, Optional } from 'src/lib';
import { ServiceVersion } from '../interfaces';
import { buildServiceVersion } from './utils';

type Values = Optional<Pick<ServiceVersion, 'definition' | 'environment' | 'isActive'>>;

export class UpdateServiceVersion {
  constructor(
    public readonly id: number,
    public readonly values: Values,
  ) {}
}

export class UpdateServiceVersionResponse {
  constructor(public readonly serviceVersion: ServiceVersion) {}
}

@CommandHandler(UpdateServiceVersion)
export class UpdateServiceVersionHandler implements ICommandHandler<UpdateServiceVersion, UpdateServiceVersionResponse> {
  constructor(
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(request: UpdateServiceVersion): Promise<UpdateServiceVersionResponse> {
    const { id, values } = request;
    const { definition, environment, isActive } = values;

    const entity = await this.serviceVersions.findOne({ where: { id }, relations: ['deploymentUpdates', 'service'] });
    if (!entity) {
      throw new NotFoundException(`Service Update ${id} not found.`);
    }

    // If the service is active, we can only update the active state so that we do not mess up existing deployments.
    if (entity.service.isPublic) {
      // Assign the object manually to avoid updating unexpected values.
      assignDefined(entity, { isActive, environment });
    } else {
      // Assign the object manually to avoid updating unexpected values.
      assignDefined(entity, { definition, environment, isActive });
    }

    // Use the save method otherwise we would not get previous values.
    const created = await this.serviceVersions.save(entity);
    const result = buildServiceVersion(created, false);

    return new UpdateServiceVersionResponse(result);
  }
}
