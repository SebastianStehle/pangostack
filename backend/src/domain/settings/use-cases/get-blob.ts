import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BlobEntity, BlobRepository } from 'src/domain/database';

export class GetBlobQuery extends Query<GetBlobResult> {
  constructor(public readonly blobId: string) {
    super();
  }
}

export class GetBlobResult {
  constructor(public readonly file?: { buffer: Buffer; type: string }) {}
}

@QueryHandler(GetBlobQuery)
export class GetBlobHandler implements IQueryHandler<GetBlobQuery, GetBlobResult> {
  constructor(
    @InjectRepository(BlobEntity)
    private readonly blobs: BlobRepository,
  ) {}

  async execute(request: GetBlobQuery): Promise<GetBlobResult> {
    const { blobId } = request;

    const blob = await this.blobs.findOneBy({ id: blobId });
    if (!blob) {
      return new GetBlobResult();
    }

    const buffer = Buffer.from(blob.buffer, 'base64');

    return new GetBlobResult({ type: blob.type, buffer });
  }
}
