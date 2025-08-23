import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
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
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard, Role, RoleGuard } from 'src/domain/auth';
import { BUILTIN_USER_GROUP_ADMIN } from 'src/domain/database';
import { DeleteBlob, GetBlobQuery, GetSettingsQuery, UpdateSettings, UploadBlob } from 'src/domain/settings';
import { SettingsDto } from './dtos';

@Controller('api/settings')
@ApiTags('settings')
export class SettingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Get('files/:fileId')
  @ApiExcludeEndpoint()
  async getLogo(@Param('fileId') fileId: string) {
    const { file } = await this.queryBus.execute(new GetBlobQuery(fileId));
    if (!file) {
      throw new NotFoundException(`File ${fileId} not found.`);
    }

    return new StreamableFile(file.buffer, { type: file.type });
  }

  @Post('files/:fileId')
  @ApiOperation({ operationId: 'postFile' })
  @ApiParam({ name: 'fileId', description: 'The ID of the file.', required: true, type: 'string' })
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
    @Param('fileId') fileId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 200_000 }),
          // Currently not working.
          //new FileTypeValidator({ fileType: /^image/ })
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.commandBus.execute(new UploadBlob(fileId, file.buffer, file.mimetype, file.filename, file.size));
  }

  @Delete('files/:fileId')
  @ApiOperation({ operationId: 'deleteFile', description: 'Deletes the file.' })
  @ApiParam({ name: 'fileId', description: 'The ID of the file.', required: true, type: 'string' })
  @ApiNoContentResponse()
  @Role(BUILTIN_USER_GROUP_ADMIN)
  @UseGuards(LocalAuthGuard, RoleGuard)
  @ApiSecurity('x-api-key')
  async deleteFile(@Param('fileId') fileId: string) {
    await this.commandBus.execute(new DeleteBlob(fileId));
  }
}
