import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { ResourceNodeStatus, ResourceStatusResult, ResourceUsage, ResourceWorkloadStatus } from 'src/resources/interface';

export class ResourceRequestDto {
  @ApiProperty({
    description: 'The resource ID',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'The name of the resource type',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @ApiProperty({
    description: 'The parameters',
    required: true,
    additionalProperties: true,
  })
  @IsObject()
  parameters: Record<string, any>;

  @ApiProperty({
    description: 'The context values that will be added or overwritten to the deployment',
    required: true,
    additionalProperties: true,
  })
  context: Record<string, any>;
}

export class StatusRequestDto {
  @ApiProperty({
    description: 'The resource identifiers',
    required: true,
    type: [ResourceRequestDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceRequestDto)
  resources: ResourceRequestDto[];
}

export class ResourceNodeStatusDto {
  @ApiProperty({
    description: 'The name of the node',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'Indicates if the node can be used',
    required: true,
  })
  isReady: boolean;

  @ApiProperty({
    description: 'The message to describe the status',
    required: false,
    nullable: true,
  })
  message: string;

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
    description: 'The name of the workload',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'All nodes within the workload',
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
    description: 'The resource ID',
    required: true,
    type: String,
  })
  resourceId: string;

  @ApiProperty({
    description: 'The type of the resource',
    required: true,
    type: String,
  })
  resourceType: string;

  @ApiProperty({
    description: 'The workflows that have been created',
    required: true,
    type: [ResourceWorkloadStatusDto],
  })
  workloads: ResourceWorkloadStatusDto[] = [];

  static fromDomain(source: ResourceStatusResult, id: string, type: string) {
    const result = new ResourceStatusDto();
    result.resourceId = id;
    result.resourceType = type;
    result.workloads = source.workloads.map(ResourceWorkloadStatusDto.fromDomain);
    return result;
  }
}

@ApiExtraModels(ResourceStatusDto)
export class StatusResultDto {
  @ApiProperty({
    description: 'The resources',
    required: true,
    type: [ResourceStatusDto],
  })
  resources: ResourceStatusDto[] = [];
}

export class UageRequestDto {
  @ApiProperty({
    description: 'The resource identifiers',
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
    description: 'The resource ID',
    required: true,
    type: String,
  })
  resourceId: string;

  @ApiProperty({
    description: 'The type of the resource',
    required: true,
    type: String,
  })
  resourceType: string;

  @ApiProperty({
    description: 'The total storage in GB',
    required: true,
  })
  totalStorageGB: number;

  static fromDomain(source: ResourceUsage, id: string, type: string) {
    const result = new ResourceUsageDto();
    result.resourceId = id;
    result.resourceType = type;
    result.totalStorageGB = source.totalStorageGB;
    return result;
  }
}

@ApiExtraModels(ResourceUsageDto)
export class UsageResultDto {
  @ApiProperty({
    description: 'The usages',
    required: true,
    type: [ResourceUsageDto],
  })
  resources: ResourceUsageDto[] = [];
}
