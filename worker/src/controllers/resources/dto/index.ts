import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { ResourceValueDescriptor, ResourceDescriptor } from 'src/resources/interface';

export class ResourceValueDto {
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

  static fromDomain(source: ResourceValueDescriptor) {
    const result = new ResourceValueDto();
    result.allowedValues = source.allowedValues;
    result.description = source.description;
    result.maxLength = source.maxLength;
    result.minLength = source.minLength;
    result.required = source.required;
    result.type = source.type;
    return result;
  }
}

@ApiExtraModels(ResourceValueDto)
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
      $ref: getSchemaPath(ResourceValueDto),
    },
  })
  parameters: Record<string, ResourceValueDto>;

  @ApiProperty({
    description: 'The context.',
    required: true,
    additionalProperties: {
      $ref: getSchemaPath(ResourceValueDto),
    },
  })
  context: Record<string, ResourceValueDto>;

  static fromDomain(source: ResourceDescriptor) {
    const result = new ResourceTypeDto();
    result.context = {};
    result.description = source.description;
    result.name = source.name;
    result.parameters = {};

    for (const [key, value] of Object.entries(source.context)) {
      result.context[key] = ResourceValueDto.fromDomain(value);
    }

    for (const [key, value] of Object.entries(source.parameters)) {
      result.parameters[key] = ResourceValueDto.fromDomain(value);
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
