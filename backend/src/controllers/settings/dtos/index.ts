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
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({
    description: 'The header color.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  primaryColor?: string | null;

  @ApiProperty({
    description: 'The primary color used for buttons and links.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  headerColor?: string | null;

  @ApiProperty({
    description: 'The primary content color used for buttons and links.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  primaryContentColor?: string | null;

  @ApiProperty({
    description: 'The welcome text.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  welcomeText?: string | null;

  @ApiProperty({
    description: 'Some custom css.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  customCss?: string | null;

  @ApiProperty({
    description: 'The footer text, for example for copyright infos.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  footerText?: string | null;

  @ApiProperty({
    description: 'The footer links.',
    nullable: true,
    type: [LinkDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  footerLinks?: LinkDto[] | null;

  static fromDomain(source: Settings) {
    const result = new SettingsDto();
    result.name = source.name;
    result.headerColor = source.headerColor;
    result.footerLinks = source.footerLinks?.map(LinkDto.fromDomain) || null;
    result.footerText = source.footerText;
    result.customCss = source.customCss;
    result.primaryColor = source.primaryColor;
    result.primaryContentColor = source.primaryContentColor;
    result.welcomeText = source.welcomeText;
    return result;
  }
}
