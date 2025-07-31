import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { ResourceApplyResult, ResourceDescriptor, ResourceParameterDescriptor } from 'src/resources/interface';

export class ResourceDeleteRequestDto {
  @ApiProperty({
    description: 'The resource ID',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'The name of the resource type.',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  resourceName: string;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsObject()
  parameters: Record<string, any>;
}

export class ResourcesDeleteRequestDto {
  @ApiProperty({
    description: 'The deployment ids.',
    required: true,
    type: [ResourceDeleteRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDeleteRequestDto)
  resources: ResourceDeleteRequestDto[];
}

export class ResourceParameterDto {
  @ApiProperty({
    description: 'The type.',
    required: true,
    enum: ['boolean', 'number', 'string'],
  })
  type: 'boolean' | 'number' | 'string';

  @ApiProperty({
    description: 'True, if required.',
    required: false,
  })
  required?: boolean;

  @ApiProperty({
    description: 'The description of the argument.',
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'The minimum length.',
    required: false,
    nullable: true,
  })
  minLength?: number;

  @ApiProperty({
    description: 'The maximum length.',
    required: false,
    nullable: true,
  })
  maxLength?: number;

  @ApiProperty({
    description: 'The enum values.',
    required: false,
    type: [String],
  })
  allowedValues?: string[];

  static fromDomain(source: ResourceParameterDescriptor) {
    const result = new ResourceParameterDto();
    result.allowedValues = source.allowedValues;
    result.description = source.description;
    result.maxLength = source.maxLength;
    result.minLength = source.minLength;
    result.required = source.required;
    result.type = source.type;
    return result;
  }
}

@ApiExtraModels(ResourceParameterDto)
export class ResourceTypeDto {
  @ApiProperty({
    description: 'The name of the resource.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The description of the resource.',
    required: true,
  })
  description: string;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: {
      $ref: getSchemaPath(ResourceParameterDto),
    },
  })
  parameters: Record<string, ResourceParameterDto>;

  static fromDomain(source: ResourceDescriptor) {
    const result = new ResourceTypeDto();
    result.name = source.name;
    result.description = source.description;
    result.parameters = {};

    for (const [key, value] of Object.entries(source.parameters)) {
      result.parameters[key] = ResourceParameterDto.fromDomain(value);
    }

    return result;
  }
}

export class ResourcesTypesDto {
  @ApiProperty({
    description: 'The available resources.',
    required: true,
    type: [ResourceTypeDto],
  })
  items: ResourceTypeDto[] = [];
}

export class ResourceApplyRequestDto {
  @ApiProperty({
    description: 'The resource ID',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'The name of the resource type.',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  resourceName: string;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsObject()
  parameters: Record<string, any>;
}

export class ResourceApplyResponseDto {
  @ApiProperty({
    description: 'The context values that will be added or overwritten to the deployment.',
    required: true,
    additionalProperties: true,
  })
  context: Record<string, any>;

  @ApiProperty({
    description: 'The output',
    required: false,
    nullable: true,
    type: String,
  })
  log: string;

  static fromDomain(source: ResourceApplyResult) {
    const result = new ResourceApplyResponseDto();
    result.context = source.context;
    result.log = source.log;
    return result;
  }
}
