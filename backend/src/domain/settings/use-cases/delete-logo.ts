import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BlobEntity, BlobRepository } from 'src/domain/database';

export class DeleteLogo {}

@CommandHandler(DeleteLogo)
export class DeleteLogoHandler implements ICommandHandler<DeleteLogo> {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobs: BlobRepository,
  ) {}

  async execute(): Promise<any> {
    await this.blobs.delete({ id: 'logo' });
  }
}
