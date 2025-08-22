import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BlobEntity, BlobRepository } from 'src/domain/database';

export class DeleteBlob {
  constructor(public readonly blobId: string) {}
}

@CommandHandler(DeleteBlob)
export class DeleteBlobHandler implements ICommandHandler<DeleteBlob> {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobs: BlobRepository,
  ) {}

  async execute(request: DeleteBlob): Promise<any> {
    const { blobId } = request;

    const { affected } = await this.blobs.delete({ id: blobId });
    if (!affected) {
      throw new NotFoundException(`Blob ${blobId} not found.`);
    }
  }
}
