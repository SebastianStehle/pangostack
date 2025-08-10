import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDefined, ValidateNested } from 'class-validator';
import { ResourceRequestDto } from 'src/controllers/shared';
import {
  InstanceLog,
  ResourceLogResult,
  ResourceNodeStatus,
  ResourceStatusResult,
  ResourceUsage,
  ResourceWorkloadStatus,
} from 'src/resources/interface';

export class StatusRequestDto {
  @ApiProperty({
    description: 'The resource identifiers.',
    required: true,
    type: [ResourceRequestDto],
  })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceRequestDto)
  resources: ResourceRequestDto[];
}

export class ResourceNodeStatusDto {
  @ApiProperty({
    description: 'The name of the node.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Indicates if the node can be used.',
    required: true,
  })
  isReady: boolean;

  @ApiProperty({
    description: 'The message to describe the status.',
    nullable: true,
    type: String,
  })
  message?: string | null;

  static fromDomain(source: ResourceNodeStatus) {
    const result = new ResourceNodeStatusDto();
    result.name = source.name;
    result.isReady = source.isReady;
    result.message = source.message;
    return result;
  }
}

export class ResourceWorkloadStatusDto {
  @ApiProperty({
    description: 'The name of the workload.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'All nodes within the workload.',
    required: true,
    type: [ResourceNodeStatusDto],
  })
  nodes: ResourceNodeStatusDto[] = [];

  static fromDomain(source: ResourceWorkloadStatus) {
    const result = new ResourceWorkloadStatusDto();
    result.name = source.name;
    result.nodes = source.nodes.map(ResourceNodeStatusDto.fromDomain);
    return result;
  }
}

export class ResourceStatusDto {
  @ApiProperty({
    description: 'The resource ID.',
    required: true,
    type: String,
  })
  resourceUniqueId: string;

  @ApiProperty({
    description: 'The type of the resource.',
    required: true,
    type: String,
  })
  resourceType: string;

  @ApiProperty({
    description: 'The workflows that have been created.',
    required: true,
    type: [ResourceWorkloadStatusDto],
  })
  workloads: ResourceWorkloadStatusDto[] = [];

  static fromDomain(source: ResourceStatusResult, id: string, type: string) {
    const result = new ResourceStatusDto();
    result.resourceUniqueId = id;
    result.resourceType = type;
    result.workloads = source.workloads.map(ResourceWorkloadStatusDto.fromDomain);
    return result;
  }
}

@ApiExtraModels(ResourceStatusDto)
export class StatusResultDto {
  @ApiProperty({
    description: 'The resources.',
    required: true,
    type: [ResourceStatusDto],
  })
  resources: ResourceStatusDto[] = [];
}

export class UsageRequestDto {
  @ApiProperty({
    description: 'The resource identifiers.',
    required: true,
    type: [ResourceRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceRequestDto)
  resources: ResourceRequestDto[];
}

export class ResourceUsageDto {
  @ApiProperty({
    description: 'The resource ID.',
    required: true,
    type: String,
  })
  resourceUniqueId: string;

  @ApiProperty({
    description: 'The type of the resource.',
    required: true,
    type: String,
  })
  resourceType: string;

  @ApiProperty({
    description: 'The total storage in GB.',
    required: true,
  })
  totalStorageGB: number;

  static fromDomain(source: ResourceUsage, id: string, type: string) {
    const result = new ResourceUsageDto();
    result.resourceUniqueId = id;
    result.resourceType = type;
    result.totalStorageGB = source.totalStorageGB;
    return result;
  }
}

@ApiExtraModels(ResourceUsageDto)
export class UsageResultDto {
  @ApiProperty({
    description: 'The usages.',
    required: true,
    type: [ResourceUsageDto],
  })
  resources: ResourceUsageDto[] = [];
}

export class InstanceLogDto {
  @ApiProperty({
    description: 'The log for a specific.',
    required: true,
  })
  instanceId: string;

  @ApiProperty({
    description: 'The log messages.',
    required: true,
  })
  messages: string;

  static fromDomain(source: InstanceLog) {
    const result = new InstanceLogDto();
    result.instanceId = source.instanceId;
    result.messages = source.messages;
    return result;
  }
}

export class ResourceLogDto {
  @ApiProperty({
    description: 'The resource ID.',
    required: true,
    type: String,
  })
  resourceUniqueId: string;

  @ApiProperty({
    description: 'The type of the resource.',
    required: true,
    type: String,
  })
  resourceType: string;

  @ApiProperty({
    description: 'The log per instance.',
    required: true,
    type: [InstanceLogDto],
  })
  instances: InstanceLogDto[];

  static fromDomain(source: ResourceLogResult, id: string, type: string) {
    const result = new ResourceLogDto();
    result.resourceUniqueId = id;
    result.resourceType = type;
    result.instances = source.instances.map(InstanceLogDto.fromDomain);
    return result;
  }
}

@ApiExtraModels(ResourceUsageDto)
export class LogResultDto {
  @ApiProperty({
    description: 'The logs per resource.',
    required: true,
    type: [ResourceLogDto],
  })
  resources: ResourceLogDto[] = [];
}

export class LogRequestDto {
  @ApiProperty({
    description: 'The resource identifiers.',
    required: true,
    type: [ResourceRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceRequestDto)
  resources: ResourceRequestDto[];
}
