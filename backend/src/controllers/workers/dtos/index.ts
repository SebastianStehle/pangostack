import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  Worker,
  ResourceMetricDto as WorkerResourceMetricDto,
  ResourceTypeDto as WorkerResourceTypeDto,
  ResourceValueDto as WorkerResourceValueDto,
} from 'src/domain/workers';

export class ResourceTypeValueDto {
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
    description: 'The description of the value.',
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

  static fromDomain(source: WorkerResourceValueDto): ResourceTypeValueDto {
    const { allowedValues, description, maxLength, minLength, required, type } = source;

    return Object.assign(new ResourceTypeValueDto(), { allowedValues, description, maxLength, minLength, required, type });
  }
}

export class ResourceTypeMetricDto {
  @ApiProperty({
    description: 'The description of the metric.',
    required: true,
  })
  description: string;

  static fromDomain(source: WorkerResourceMetricDto): ResourceTypeMetricDto {
    const { description } = source;

    return Object.assign(new ResourceTypeMetricDto(), { description });
  }
}

@ApiExtraModels(ResourceTypeValueDto, ResourceTypeMetricDto)
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
      $ref: getSchemaPath(ResourceTypeValueDto),
    },
  })
  parameters: Record<string, ResourceTypeValueDto>;

  @ApiProperty({
    description: 'The context.',
    required: true,
    additionalProperties: {
      $ref: getSchemaPath(ResourceTypeValueDto),
    },
  })
  context: Record<string, ResourceTypeValueDto>;

  @ApiProperty({
    description: 'The metrics that the resource can provide.',
    required: true,
    additionalProperties: {
      $ref: getSchemaPath(ResourceTypeMetricDto),
    },
  })
  metrics: Record<string, ResourceTypeMetricDto>;

  static fromDomain(source: WorkerResourceTypeDto): ResourceTypeDto {
    const { context, description, metrics, name, parameters } = source;

    const result = new ResourceTypeDto();
    result.context = mapRecord(context, ResourceTypeValueDto.fromDomain);
    result.description = description;
    result.metrics = mapRecord(metrics, ResourceTypeMetricDto.fromDomain);
    result.name = name;
    result.parameters = mapRecord(parameters, ResourceTypeValueDto.fromDomain);
    return result;
  }
}

export class ResourceTypesDto {
  @ApiProperty({
    description: 'The available resource types.',
    required: true,
    type: [ResourceTypeDto],
  })
  items: ResourceTypeDto[];

  static fromDomain(source: WorkerResourceTypeDto[]): ResourceTypesDto {
    const result = new ResourceTypesDto();
    result.items = source.map(ResourceTypeDto.fromDomain);
    return result;
  }
}

export class WorkerDto {
  @ApiProperty({
    description: 'The endpoint of the worker.',
    required: true,
  })
  endpoint: string;

  @ApiProperty({
    description: 'Indicates if the worker can be reached.',
    required: true,
  })
  isReady: boolean;

  static fromDomain(source: Worker): WorkerDto {
    const result = new WorkerDto();
    result.endpoint = source.endpoint;
    result.isReady = source.isReady;
    return result;
  }
}

export class WorkersDto {
  @ApiProperty({
    description: 'The workers.',
    required: true,
    type: [WorkerDto],
  })
  items: WorkerDto[];

  static fromDomain(source: Worker[]): WorkersDto {
    const result = new WorkersDto();
    result.items = source.map(WorkerDto.fromDomain);
    return result;
  }
}

function mapRecord<T, R>(source: Record<string, T>, mapper: (value: T) => R): Record<string, R> {
  const result: Record<string, R> = {};

  for (const [key, value] of Object.entries(source || {})) {
    result[key] = mapper(value);
  }

  return result;
}
