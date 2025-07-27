import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { IsDefined, IsString } from 'class-validator';

export class ImageUrlDto {
  @ApiProperty({
    description: 'The image URL. Usually a base64 encoded image.',
    required: true,
  })
  public url: string;
}

export class ChatSuggestionDto {
  @ApiProperty({
    description: 'The title.',
    required: true,
  })
  @IsDefined()
  @IsString()
  public title: string;

  @ApiProperty({
    description: 'The subtitle.',
    required: true,
  })
  @IsDefined()
  @IsString()
  public subtitle: string;

  @ApiProperty({
    description: 'The text to copy.',
    required: true,
  })
  @IsDefined()
  @IsString()
  public text: string;
}

export class MessageContentTextDto {
  static TYPE_NAME = 'text';

  @ApiProperty({
    description: 'The content as text.',
    required: true,
  })
  public text: string;

  @ApiProperty({
    enum: [MessageContentTextDto.TYPE_NAME],
  })
  public type: typeof MessageContentTextDto.TYPE_NAME;
}

export class MessageContentImageUrlDto {
  static TYPE_NAME = 'image_url';

  @ApiProperty({
    description: 'The content as image.',
    required: true,
    type: ImageUrlDto,
  })
  public image: ImageUrlDto;

  @ApiProperty({
    enum: [MessageContentImageUrlDto.TYPE_NAME],
  })
  public type: typeof MessageContentImageUrlDto.TYPE_NAME;
}

export const MessageContentDto: SchemaObject = {
  title: 'MessageContentDto',
  oneOf: [
    {
      $ref: getSchemaPath(MessageContentTextDto),
    },
    {
      $ref: getSchemaPath(MessageContentImageUrlDto),
    },
  ],
  discriminator: {
    propertyName: 'type',
    mapping: {
      [MessageContentTextDto.TYPE_NAME]: getSchemaPath(MessageContentTextDto),
      [MessageContentImageUrlDto.TYPE_NAME]: getSchemaPath(MessageContentImageUrlDto),
    },
  },
};
