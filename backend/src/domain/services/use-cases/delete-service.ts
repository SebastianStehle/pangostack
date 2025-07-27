import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceEntity, ServiceRepository } from 'src/domain/database';

export class DeleteService {
  constructor(public readonly id: number) {}
}

@CommandHandler(DeleteService)
export class DeleteServiceHandler implements ICommandHandler<DeleteService, any> {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly services: ServiceRepository,
  ) {}

  async execute(command: DeleteService): Promise<any> {
    const { id } = command;

    const result = await this.services.delete({ id });
    if (!result.affected) {
      throw new NotFoundException(`Service ${id} not found.`);
    }
  }
}
