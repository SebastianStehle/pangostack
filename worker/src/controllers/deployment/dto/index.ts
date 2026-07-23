import { ApiProperty, getSchemaPath, OpenAPIObject, refs } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { SchemaObjectFactory } from '@nestjs/swagger/dist/services/schema-object-factory';
import { SwaggerTypesMapper } from '@nestjs/swagger/dist/services/swagger-types-mapper';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { ResourceRequestDto } from 'src/controllers/shared';

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

// Each event is its own concrete shape. The `type` property is the discriminator that selects the
// member of the ResourceEventDto union (see RESOURCE_EVENT_MODELS and main.ts).

class EventBaseDto {
  @ApiProperty({
    description: 'When the event happened.',
    required: true,
    type: Date,
  })
  timestamp: Date;
}

export class StartStepEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'startStep';

  @ApiProperty({
    description: 'The generated id of the sub-step.',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The name of the sub-step, for example "Waiting for workloads".',
    required: true,
  })
  name: string;
}

export class CompleteStepEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'completeStep';

  @ApiProperty({
    description: 'The id of the sub-step.',
    required: true,
  })
  id: string;
}

export class FailStepEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'failStep';

  @ApiProperty({
    description: 'The id of the sub-step.',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The failure message.',
    nullable: true,
    type: String,
  })
  message: string | null;
}

export class AppendLogEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'appendLog';

  @ApiProperty({
    description: 'The id of the sub-step the line belongs to, or null when reported outside a step.',
    nullable: true,
    type: String,
  })
  stepId: string | null;

  @ApiProperty({
    description: 'The line appended to the log.',
    required: true,
  })
  message: string;
}

export class AppendContextEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'appendContext';

  @ApiProperty({
    description: 'Context values added or overwritten in the deployment.',
    required: true,
    additionalProperties: true,
  })
  context: Record<string, any>;
}

export class AppendResourceContextEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'appendResourceContext';

  @ApiProperty({
    description: 'Resource-scoped context persisted between subsequent calls.',
    required: true,
    additionalProperties: true,
  })
  context: Record<string, any>;
}

export class AppendConnectionEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'appendConnection';

  @ApiProperty({
    description: 'Connection info, for example Api Keys.',
    required: true,
    additionalProperties: { $ref: getSchemaPath(ConnectInfoDto) },
  })
  connection: Record<string, ConnectInfoDto>;
}

export class CompleteEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'complete';
}

export class FailEventDto extends EventBaseDto {
  @ApiProperty({
    description: 'The event type.',
    required: true,
  })
  type: 'fail';

  @ApiProperty({
    description: 'The error message.',
    required: true,
  })
  error: string;
}

// The members of the ResourceEventDto discriminated union, paired with their discriminator value.
const RESOURCE_EVENT_MODELS = [
  { value: 'startStep', model: StartStepEventDto },
  { value: 'completeStep', model: CompleteStepEventDto },
  { value: 'failStep', model: FailStepEventDto },
  { value: 'appendLog', model: AppendLogEventDto },
  { value: 'appendContext', model: AppendContextEventDto },
  { value: 'appendResourceContext', model: AppendResourceContextEventDto },
  { value: 'appendConnection', model: AppendConnectionEventDto },
  { value: 'complete', model: CompleteEventDto },
  { value: 'fail', model: FailEventDto },
] as const;

// The streamed apply endpoint is @ApiExcludeEndpoint (generated clients cannot consume NDJSON), so
// nothing references the events and Nest emits neither their schemas nor a union. We register the
// concrete members (and ConnectInfoDto, referenced by AppendConnectionEventDto) and combine them
// into a proper discriminated union, so the generator produces a real ResourceEventDto union type.
export function registerResourceEventSchema(document: OpenAPIObject) {
  document.components ??= {};
  const schemas = (document.components.schemas ??= {}) as Record<string, SchemaObject>;

  const factory = new SchemaObjectFactory(new ModelPropertiesAccessor(), new SwaggerTypesMapper());
  for (const model of [ConnectInfoDto, ...RESOURCE_EVENT_MODELS.map(({ model }) => model)]) {
    factory.exploreModelSchema(model, schemas);
  }

  schemas['ResourceEventDto'] = {
    oneOf: refs(...RESOURCE_EVENT_MODELS.map(({ model }) => model)),
    discriminator: {
      propertyName: 'type',
      mapping: Object.fromEntries(RESOURCE_EVENT_MODELS.map(({ value, model }) => [value, getSchemaPath(model)])),
    },
  };
}
