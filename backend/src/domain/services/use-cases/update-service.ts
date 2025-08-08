import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Service } from '../interfaces';
import { buildService } from './utils';

type Values = Omit<Service, 'id' | 'isActive' | 'lastVersion' | 'numDeployments'>;

export class UpdateService {
  constructor(
    public readonly id: number,
    public readonly values: Values,
  ) {}
}

export class UpdateServiceResponse {
  constructor(public readonly service: Service) {}
}

@CommandHandler(UpdateService)
export class UpdateServiceHandler implements ICommandHandler<UpdateService, UpdateServiceResponse> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(request: UpdateService): Promise<UpdateServiceResponse> {
    const { id, values } = request;
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

    const service = await this.services.findOne({ where: { id }, relations: ['versions', 'versions.deploymentUpdates'] });
    if (!service) {
      throw new NotFoundException(`Service ${id} not found.`);
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

    return new UpdateServiceResponse(buildService(service));
  }
}
