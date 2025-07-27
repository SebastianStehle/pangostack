import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BlobEntity, BlobRepository } from 'src/domain/database';

export class DeleteLogo {}

export class DeleteLogoResponse {}

@CommandHandler(DeleteLogo)
export class DeleteLogoHandler implements ICommandHandler<DeleteLogo, DeleteLogoResponse> {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobs: BlobRepository,
  ) {}

  async execute(): Promise<DeleteLogoResponse> {
    await this.blobs.delete({ id: 'logo' });

    return new DeleteLogoResponse();
  }
}
