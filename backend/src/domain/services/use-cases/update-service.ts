import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Service } from '../interfaces';
import { buildService } from './utils';

type Values = Omit<Service, 'id' | 'isActive' | 'lastVersion' | 'numDeployments'>;

export class UpdateService extends Command<UpdateServiceResult> {
  constructor(
    public readonly serviceId: number,
    public readonly values: Values,
  ) {
    super();
  }
}

export class UpdateServiceResult {
  constructor(public readonly service: Service) {}
}

@CommandHandler(UpdateService)
export class UpdateServiceHandler implements ICommandHandler<UpdateService, UpdateServiceResult> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(request: UpdateService): Promise<UpdateServiceResult> {
    const { serviceId, values } = request;
    const {
      currency,
      description,
      environment,
      fixedPrice,
      isPublic,
      name,
      pricePerCoreHour,
      pricePerVolumeGBHour,
      pricePerMemoryGBHour,
      pricePerStorageGBMonth,
    } = values;

    const service = await this.services.findOne({
      where: { id: serviceId },
      relations: ['versions', 'versions.deploymentUpdates'],
    });
    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found.`);
    }

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(service, {
      currency,
      description,
      environment,
      fixedPrice,
      isPublic,
      name,
      pricePerCoreHour,
      pricePerVolumeGBHour,
      pricePerMemoryGBHour,
      pricePerStorageGBMonth,
    });
    await this.services.save(service);

    return new UpdateServiceResult(buildService(service));
  }
}
