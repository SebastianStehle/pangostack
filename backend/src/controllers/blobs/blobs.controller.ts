import { Controller, Get, NotFoundException, Param, StreamableFile, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/domain/auth';
import { GetBlob, GetBlobResponse } from 'src/domain/settings';

@Controller('blobs')
@UseGuards(LocalAuthGuard)
export class BlobsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':blobId')
  @ApiExcludeEndpoint()
  async getLogo(@Param('blobId') blobId: string) {
    const result: GetBlobResponse = await this.queryBus.execute(new GetBlob(blobId));

    if (!result.logo) {
      throw new NotFoundException('Cannot find logo.');
    }

    return new StreamableFile(result.logo.buffer, { type: result.logo.type });
  }
}
