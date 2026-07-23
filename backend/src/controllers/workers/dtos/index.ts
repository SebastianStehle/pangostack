import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import {
  Worker,
  ResourceMetricDto as WorkerResourceMetricDto,
  ResourceTypeDto as WorkerResourceTypeDto,
  ResourceValueDto as WorkerResourceValueDto,
  WorkerStatus,
  WorkerWithStatus,
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

export class WorkerStatusDto {
  @ApiProperty({
    description: 'Indicates if the worker can be reached.',
    required: true,
  })
  isReady: boolean;

  @ApiProperty({
    description: 'The timestamp when the worker has been started.',
    nullable: true,
    type: String,
  })
  startedAt?: string | null;

  @ApiProperty({
    description: 'The resource types that the worker provides.',
    required: true,
    type: [String],
  })
  resourceTypes: string[];

  @ApiProperty({
    description: 'The reason why the worker could not be reached.',
    nullable: true,
    type: String,
  })
  error?: string | null;

  static fromDomain(source: WorkerStatus): WorkerStatusDto {
    const { error, isReady, resourceTypes, startedAt } = source;

    return Object.assign(new WorkerStatusDto(), { error, isReady, resourceTypes, startedAt });
  }
}

@ApiExtraModels(WorkerStatusDto)
export class WorkerDto {
  @ApiProperty({
    description: 'The ID of the worker.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The endpoint of the worker.',
    required: true,
  })
  endpoint: string;

  @ApiProperty({
    description: 'Indicates if an API key has been configured. The key itself is never exposed.',
    required: true,
  })
  hasApiKey: boolean;

  static fromDomain(source: Worker): WorkerDto {
    const { endpoint, hasApiKey, id } = source;

    return Object.assign(new WorkerDto(), { endpoint, hasApiKey, id });
  }
}

export class WorkerWithStatusDto extends WorkerDto {
  @ApiProperty({
    description: 'The current status of the worker.',
    required: true,
    type: WorkerStatusDto,
  })
  status: WorkerStatusDto;

  static fromDomain(source: WorkerWithStatus): WorkerWithStatusDto {
    const { endpoint, hasApiKey, id, status } = source;

    return Object.assign(new WorkerWithStatusDto(), {
      endpoint,
      hasApiKey,
      id,
      status: WorkerStatusDto.fromDomain(status),
    });
  }
}

export class WorkersDto {
  @ApiProperty({
    description: 'The workers.',
    required: true,
    type: [WorkerWithStatusDto],
  })
  items: WorkerWithStatusDto[];

  static fromDomain(source: WorkerWithStatus[]): WorkersDto {
    const result = new WorkersDto();
    result.items = source.map(WorkerWithStatusDto.fromDomain);
    return result;
  }
}

export class UpsertWorkerDto {
  @ApiProperty({
    description: 'The endpoint of the worker.',
    required: true,
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  // Workers usually run on hosts without a TLD, e.g. http://localhost:3100, but a protocol is required
  // because the value is used as the base path of the worker client.
  @IsUrl({ require_tld: false, require_protocol: true, protocols: ['http', 'https'] })
  endpoint: string;

  @ApiProperty({
    description: 'The API key to authenticate against the worker. Keeps the current key when not defined.',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  apiKey?: string;
}

function mapRecord<T, R>(source: Record<string, T>, mapper: (value: T) => R): Record<string, R> {
  const result: Record<string, R> = {};

  for (const [key, value] of Object.entries(source || {})) {
    result[key] = mapper(value);
  }

  return result;
}
