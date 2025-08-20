import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';
import { Service } from '../interfaces';
import { buildService } from './utils';

type Values = Omit<Service, 'id' | 'isActive' | 'lastestVersion' | 'numDeployments'>;

export class CreateService extends Command<CreateServiceResult> {
  constructor(public readonly values: Values) {
    super();
  }
}

export class CreateServiceResult {
  constructor(public readonly service: Service) {}
}

@CommandHandler(CreateService)
export class CreateServiceHandler implements ICommandHandler<CreateService, CreateServiceResult> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(request: CreateService): Promise<CreateServiceResult> {
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

    return new CreateServiceResult(buildService(service));
  }
}
