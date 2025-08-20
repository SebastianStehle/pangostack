import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceVersionEntity, ServiceVersionRepository } from 'src/domain/database';
import { assignDefined, Optional } from 'src/lib';
import { ServiceVersion } from '../interfaces';
import { buildServiceVersion } from './utils';

type Values = Optional<Pick<ServiceVersion, 'definition' | 'environment' | 'isActive'>>;

export class UpdateServiceVersion extends Command<UpdateServiceVersionResult> {
  constructor(
    public readonly serviceId: number,
    public readonly values: Values,
  ) {
    super();
  }
}

export class UpdateServiceVersionResult {
  constructor(public readonly serviceVersion: ServiceVersion) {}
}

@CommandHandler(UpdateServiceVersion)
export class UpdateServiceVersionHandler implements ICommandHandler<UpdateServiceVersion, UpdateServiceVersionResult> {
  constructor(
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceVersionRepository,
  ) {}

  async execute(request: UpdateServiceVersion): Promise<UpdateServiceVersionResult> {
    const { serviceId, values } = request;
    const { definition, environment, isActive } = values;

    const version = await this.serviceVersions.findOne({ where: { id: serviceId }, relations: ['deploymentUpdates', 'service'] });
    if (!version) {
      throw new NotFoundException(`Service Update ${serviceId} not found.`);
    }

    // If the service is active, we can only update the active state so that we do not mess up existing deployments.
    if (version.service.isPublic) {
      assignDefined(version, { isActive, environment });
    } else {
      assignDefined(version, { definition, environment, isActive });
    }

    await this.serviceVersions.save(version);

    return new UpdateServiceVersionResult(buildServiceVersion(version, false));
  }
}
