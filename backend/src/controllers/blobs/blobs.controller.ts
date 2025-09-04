import { Controller, Get, NotFoundException, Param, StreamableFile, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/domain/auth';
import { GetBlobQuery } from 'src/domain/settings';

@Controller('api/blobs')
@UseGuards(LocalAuthGuard)
export class BlobsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':blobId')
  @ApiExcludeEndpoint()
  async getBlob(@Param('blobId') blobId: string) {
    const { file } = await this.queryBus.execute(new GetBlobQuery(blobId));

    if (!file) {
      throw new NotFoundException('Cannot find logo.');
    }

    return new StreamableFile(file.buffer, { type: file.type });
  }
}
