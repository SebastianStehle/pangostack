import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { ResourceNodeStatus, ResourceStatusResult, ResourceWorkloadStatus } from 'src/resources/interface';

export class StatusRequestResourceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The resource ID',
    required: true,
    type: String,
  })
  resourceId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the resource type.',
    required: true,
    type: String,
  })
  resourceName: string;

  @IsObject()
  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  parameters: Record<string, any>;
}

export class StatusRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusRequestResourceDto)
  @ApiProperty({
    description: 'The resource identifiers',
    required: true,
    type: [StatusRequestResourceDto],
  })
  resources: StatusRequestResourceDto[];
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
    description: 'The resource ID',
    required: true,
    type: String,
  })
  resourceId: string;

  @ApiProperty({
    description: 'The name of the resource type.',
    required: true,
    type: String,
  })
  resourceName: string;

  @ApiProperty({
    description: 'The workflows that have been created',
    required: true,
    type: [ResourceWorkloadStatusDto],
  })
  workloads: ResourceWorkloadStatusDto[] = [];

  static fromDomain(source: ResourceStatusResult, id: string, name: string) {
    const result = new ResourceStatusDto();
    result.resourceId = id;
    result.resourceName = name;
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
