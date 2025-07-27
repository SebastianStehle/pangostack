import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Service } from '../interfaces';
import { buildService } from './utils';

type Values = Omit<Service, 'id'>;

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
      pricePerCpuHour,
      pricePerDiskGbHour,
      pricePerMemoryGbHour,
      pricePerStorageGbHour,
    } = values;

    const entity = await this.services.findOne({ where: { id }, relations: ['versions', 'versions.deploymentUpdates'] });
    if (!entity) {
      throw new NotFoundException(`Service ${id} not found.`);
    }

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(entity, {
      currency,
      description,
      environment,
      fixedPrice,
      isPublic,
      name,
      pricePerCpuHour,
      pricePerDiskGbHour,
      pricePerMemoryGbHour,
      pricePerStorageGbHour,
    });

    // Use the save method otherwise we would not get previous values.
    const created = await this.services.save(entity);
    const result = buildService(created);

    return new UpdateServiceResponse(result);
  }
}
