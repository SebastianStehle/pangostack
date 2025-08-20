import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiExcludeEndpoint,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';
import { DeleteLogo, GetBlobQuery, GetSettingsQuery, UpdateSettings, UploadBlob } from 'src/domain/settings';
import { SettingsDto } from './dtos';

@Controller('settings')
@ApiTags('settings')
export class SettingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('logo')
  @ApiExcludeEndpoint()
  async getLogo() {
    const { file } = await this.queryBus.execute(new GetBlobQuery('__logo'));

    if (!file) {
      throw new NotFoundException('Cannot find logo.');
    }

    return new StreamableFile(file.buffer, { type: file.type });
  }

  @Get('')
  @ApiOperation({ operationId: 'getSettings', description: 'Gets settings.' })
  @ApiOkResponse({ type: SettingsDto })
  async getSettings() {
    const { settings } = await this.queryBus.execute(new GetSettingsQuery());

    return SettingsDto.fromDomain(settings);
  }

  @Post('')
  @ApiOperation({ operationId: 'postSettings', description: 'Update settings.' })
  @ApiOkResponse({ type: SettingsDto })
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(LocalAuthGuard, RoleGuard)
  @ApiSecurity('x-api-key')
  async postSettings(@Body() request: SettingsDto) {
    const { settings } = await this.commandBus.execute(new UpdateSettings(request as any));

    return SettingsDto.fromDomain(settings);
  }

  @Post('logo')
  @ApiOperation({ operationId: 'postLogo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(LocalAuthGuard, RoleGuard)
  @ApiSecurity('x-api-key')
  async postLogo(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 200_000 }),
          new FileTypeValidator({ fileType: /(image\/jpeg)|(image\/png)|(image\/webp)|(image\/svg\+xml)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.commandBus.execute(new UploadBlob('__logo', file.buffer, file.mimetype, file.filename, file.size));
  }

  @Delete('logo')
  @ApiOperation({ operationId: 'deleteLogo', description: 'Deletes the logo.' })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(LocalAuthGuard, RoleGuard)
  @ApiSecurity('x-api-key')
  async deleteLogo() {
    await this.commandBus.execute(new DeleteLogo());
  }
}
