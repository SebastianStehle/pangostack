import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceRepository, ServiceVersionEntity } from 'src/domain/database';

export class DeleteServiceVersion {
  constructor(public readonly serviceVersionId: number) {}
}

@CommandHandler(DeleteServiceVersion)
export class DeleteServiceVersionHandler implements ICommandHandler<DeleteServiceVersion, any> {
  constructor(
    @InjectRepository(ServiceVersionEntity)
    private readonly serviceVersions: ServiceRepository,
  ) {}

  async execute(command: DeleteServiceVersion): Promise<any> {
    const { serviceVersionId } = command;

    const { affected } = await this.serviceVersions.delete({ id: serviceVersionId });
    if (!affected) {
      throw new NotFoundException(`Service ${serviceVersionId} not found.`);
    }
  }
}
