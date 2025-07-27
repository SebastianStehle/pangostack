import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class ParameterDefinition {
  @IsString()
  name: string;

  @IsIn(['string', 'number'])
  type: 'string' | 'number';

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsNumber()
  default?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumValue?: number;

  @IsOptional()
  @IsNumber()
  maximumValue?: number;

  @IsOptional()
  @IsString()
  section?: string;
}

export class ResourceDefinition {
  @IsString()
  name: string;

  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsObject()
  parameters: Record<string, string>;
}

export class UsageDefinition {
  @IsString()
  totalCpus: string;

  @IsString()
  totalMembery: string;

  @IsString()
  totalStorage: string;
}

export class ServiceDefinition {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterDefinition)
  parameters: ParameterDefinition[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDefinition)
  resources: ResourceDefinition[];

  @ValidateNested()
  @Type(() => UsageDefinition)
  usage: UsageDefinition;
}

export class ResourcesDefinition {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDefinition)
  resources: ResourceDefinition[];
}
