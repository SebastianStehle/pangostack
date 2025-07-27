import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Settings } from 'src/domain/settings';

export class SettingsDto {
  @ApiProperty({
    description: 'The name of the app.',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The primary color used for buttons and links.',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({
    description: 'The primary content color used for buttons and links.',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryContentColor?: string;

  @ApiProperty({
    description: 'The welcome text.',
    required: false,
  })
  @IsOptional()
  @IsString()
  welcomeText?: string;

  @ApiProperty({
    description: 'Some custom css.',
    required: false,
  })
  @IsOptional()
  @IsString()
  customCss?: string;

  static fromDomain(source: Settings) {
    const result = new SettingsDto();
    result.name = source.name;
    result.customCss = source.customCss;
    result.primaryColor = source.primaryColor;
    result.primaryContentColor = source.primaryContentColor;
    result.welcomeText = source.welcomeText;

    return result;
  }
}
