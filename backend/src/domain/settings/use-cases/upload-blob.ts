import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BlobEntity, BlobRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';

export class UploadBlob {
  constructor(
    public readonly blobId: string,
    public readonly buffer: Buffer,
    public readonly mimeType: string,
    public readonly fileName: string,
    public readonly fileSize: number,
  ) {}
}

@CommandHandler(UploadBlob)
export class UploadBlobHandler implements ICommandHandler<UploadBlob> {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobs: BlobRepository,
  ) {}

  async execute(request: UploadBlob): Promise<any> {
    const { blobId, mimeType: type } = request;

    const buffer = request.buffer.toString('base64');

    await saveAndFind(this.blobs, { id: blobId, type, buffer });
  }
}
