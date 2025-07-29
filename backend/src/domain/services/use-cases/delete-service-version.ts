import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceRepository, ServiceVersionEntity } from 'src/domain/database';

export class DeleteServiceVersion {
  constructor(public readonly id: number) {}
}

@CommandHandler(DeleteServiceVersion)
export class DeleteServiceVersionHandler implements ICommandHandler<DeleteServiceVersion, any> {
  constructor(
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceRepository,
  ) {}

  async execute(command: DeleteServiceVersion): Promise<any> {
    const { id } = command;

    const { affected } = await this.serviceVersions.delete({ id });
    if (!affected) {
      throw new NotFoundException(`Service ${id} not found.`);
    }
  }
}
