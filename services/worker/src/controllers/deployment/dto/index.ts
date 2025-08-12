import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { ResourceRequestDto } from 'src/controllers/shared';
import { ResourceApplyResult, ResourceDescriptor, ResourceParameterDescriptor } from 'src/resources/interface';

export class ResourcesDeleteRequestDto {
  @ApiProperty({
    description: 'The resourced to delete.',
    required: true,
    type: [ResourceRequestDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceRequestDto)
  resources: ResourceRequestDto[];
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
    nullable: true,
    type: Boolean,
  })
  required?: boolean | null;

  @ApiProperty({
    description: 'The description of the argument.',
    nullable: true,
    type: String,
  })
  description?: string | null;

  @ApiProperty({
    description: 'The minimum length.',
    nullable: true,
    type: Number,
  })
  minLength?: number | null;

  @ApiProperty({
    description: 'The maximum length.',
    nullable: true,
    type: Number,
  })
  maxLength?: number | null;

  @ApiProperty({
    description: 'The enum values.',
    nullable: true,
    type: [String],
  })
  allowedValues?: string[] | null;

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

export class ConnectInfoDto {
  @ApiProperty({
    description: 'The value.',
    required: true,
  })
  value: string;

  @ApiProperty({
    description: 'The label.',
    required: true,
  })
  label: string;

  @ApiProperty({
    description: 'Indicates if the info is public.',
    required: true,
  })
  isPublic: boolean;

  static fromDomain(source: { value: string; label: string; isPublic: boolean }) {
    const result = new ConnectInfoDto();
    result.value = source.value;
    result.label = source.label;
    result.isPublic = source.isPublic;

    return result;
  }
}

@ApiExtraModels(ConnectInfoDto)
export class ResourceApplyResponseDto {
  @ApiProperty({
    description: 'The context values that will be added or overwritten to the deployment.',
    required: true,
    additionalProperties: true,
  })
  context: Record<string, any>;

  @ApiProperty({
    description: 'Context that only contains values that are needed for this resource betwene subsequent calls.',
    nullable: true,
    additionalProperties: true,
  })
  resourceContext?: Record<string, any> | null;

  @ApiProperty({
    description: 'The output.',
    nullable: true,
    type: String,
  })
  log?: string | null;

  @ApiProperty({
    description: 'Provides values how to connect to the resource, for example Api Keys.',
    required: true,
    additionalProperties: {
      $ref: getSchemaPath(ConnectInfoDto),
    },
  })
  connection: Record<string, ConnectInfoDto>;

  static fromDomain(source: ResourceApplyResult) {
    const result = new ResourceApplyResponseDto();
    result.log = source.log;
    result.context = source.context;
    result.connection = {};
    result.resourceContext = source.resourceContext;

    for (const [key, value] of Object.entries(source.connection)) {
      result.connection[key] = ConnectInfoDto.fromDomain(value);
    }

    return result;
  }
}
