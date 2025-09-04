import { Ico, IcoImage } from '@fiahfy/ico';
import { Controller, Get, NotFoundException, Query, StreamableFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import * as sharp from 'sharp';
import { GetBlobQuery, UploadBlob } from 'src/domain/settings';

@Controller()
export class FaviconController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('favicon.ico')
  @ApiExcludeEndpoint()
  async getFavicon(@Query('force') force?: string | null) {
    return this.getFaviconCore('favicon', 'favicon.ico', 'image/x-icon', 16, force === '1');
  }

  @Get('favicon-16x16.png')
  @ApiExcludeEndpoint()
  async getFavicon16(@Query('force') force?: string | null) {
    return this.getFaviconCore('favicon', 'favicon-16x16.png', 'image/png', 16, force === '1');
  }

  @Get('favicon-32x32.png')
  @ApiExcludeEndpoint()
  async getFavicon32(@Query('force') force?: string | null) {
    return this.getFaviconCore('favicon', 'favicon-32x32.png', 'image/png', 32, force === '1');
  }

  @Get('apple-touch-icon.png')
  @ApiExcludeEndpoint()
  async getAppleTouchIcon(@Query('force') force?: string | null) {
    return this.getFaviconCore('favicon', 'apple-touch-icon.png', 'image/png', 180, force === '1');
  }

  async getFaviconCore(blobId: string, variant: string, type: string, size: number, force = false): Promise<StreamableFile> {
    const cacheKey = `${blobId}_${variant}`;
    if (!force) {
      const { file: cached } = await this.queryBus.execute(new GetBlobQuery(cacheKey));
      if (cached) {
        return new StreamableFile(cached.buffer, { type });
      }
    }

    const { file } = await this.queryBus.execute(new GetBlobQuery(blobId));
    if (!file) {
      throw new NotFoundException('Cannot find logo.');
    }

    let result: Buffer;
    if (variant.endsWith('.ico')) {
      const ico = new Ico();

      for (const icoSize of [16, 32, 48]) {
        const resized = await sharp(file.buffer).resize(icoSize, icoSize).ensureAlpha().png().toBuffer();

        ico.append(IcoImage.from(resized));
      }

      console.log(ico.data.length);
      result = ico.data;
    } else {
      result = await sharp(file.buffer).resize(size, size).png().toBuffer();
    }

    await this.commandBus.execute(new UploadBlob(cacheKey, result, type, cacheKey, result.length));
    return new StreamableFile(result, { type });
  }
}
