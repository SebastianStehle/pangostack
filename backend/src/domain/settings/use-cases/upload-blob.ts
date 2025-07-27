import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BlobEntity, BlobRepository } from 'src/domain/database';

export class UploadBlob {
  constructor(
    public readonly id: string,
    public readonly buffer: Buffer,
    public readonly mimeType: string,
    public readonly fileName: string,
    public readonly fileSize: number,
  ) {}
}

export class UploadBlobResponse {}

@CommandHandler(UploadBlob)
export class UploadBlobHandler implements ICommandHandler<UploadBlob, UploadBlobResponse> {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobs: BlobRepository,
  ) {}

  async execute(request: UploadBlob): Promise<UploadBlobResponse> {
    const { id, mimeType: type } = request;

    const buffer = request.buffer.toString('base64');

    await this.blobs.save({ id, type, buffer });

    return new UploadBlobResponse();
  }
}
