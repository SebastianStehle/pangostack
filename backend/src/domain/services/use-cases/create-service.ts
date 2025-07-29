import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Service } from '../interfaces';
import { buildService } from './utils';

type Values = Omit<Service, 'id' | 'isActive' | 'lastestVersion' | 'numDeployments'>;

export class CreateService {
  constructor(public readonly values: Values) {}
}

export class CreateServiceResponse {
  constructor(public readonly service: Service) {}
}

@CommandHandler(CreateService)
export class CreateServiceHandler implements ICommandHandler<CreateService, CreateServiceResponse> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(request: CreateService): Promise<CreateServiceResponse> {
    const { values } = request;
    const {
      currency,
      description,
      environment,
      fixedPrice,
      isPublic,
      name,
      pricePerCpuHour,
      pricePerVolumeGbHour,
      pricePerMemoryGbHour,
      pricePerStorageGbMonth,
    } = values;

    const entity = this.services.create();

    // Assign the object manually to avoid updating unexpected values.
    assignDefined(entity, {
      currency,
      description,
      environment,
      fixedPrice,
      isPublic,
      name,
      pricePerCpuHour,
      pricePerVolumeGbHour,
      pricePerMemoryGbHour,
      pricePerStorageGbMonth,
    });

    // Use the save method otherwise we would not get previous values.
    const created = await this.services.save(entity);
    const result = buildService(created);

    return new CreateServiceResponse(result);
  }
}
