import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';
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
      pricePerCoreHour,
      pricePerVolumeGBHour,
      pricePerMemoryGBHour,
      pricePerStorageGBMonth,
    } = values;

    const service = await saveAndFind(this.services, {
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

    return new CreateServiceResponse(buildService(service));
  }
}
