import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SettingLink, Settings } from 'src/domain/settings';

export class LinkDto {
  @ApiProperty({
    description: 'The title.',
    required: true,
  })
  @IsDefined()
  @IsString()
  public title: string;

  @ApiProperty({
    description: 'The URL of the link.',
    required: true,
  })
  @IsDefined()
  @IsString()
  public url: string;

  static fromDomain(source: SettingLink) {
    const result = new LinkDto();
    result.title = source.title;
    result.url = source.url;

    return result;
  }
}

export class SettingsDto {
  @ApiProperty({
    description: 'The name of the app.',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The header color.',
    required: false,
  })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({
    description: 'The primary color used for buttons and links.',
    required: false,
  })
  @IsOptional()
  @IsString()
  headerColor?: string;

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

  @ApiProperty({
    description: 'The footer links.',
    required: false,
    type: [LinkDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  footerLinks?: LinkDto[];

  @ApiProperty({
    description: 'The footer text, for example for copyright infos.',
    required: false,
  })
  @IsOptional()
  @IsString()
  footerText?: string;

  static fromDomain(source: Settings) {
    const result = new SettingsDto();
    result.name = source.name;
    result.headerColor = source.headerColor;
    result.footerLinks = source.footerLinks?.map(LinkDto.fromDomain);
    result.footerText = source.footerText;
    result.customCss = source.customCss;
    result.primaryColor = source.primaryColor;
    result.primaryContentColor = source.primaryContentColor;
    result.welcomeText = source.welcomeText;

    return result;
  }
}
