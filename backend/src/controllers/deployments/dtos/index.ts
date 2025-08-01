import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsObject, IsOptional, MaxLength } from 'class-validator';
import { Deployment, ResourceNodeStatus, ResourceStatus, ResourceWorkloadStatus } from 'src/domain/services';

export class CreateDeploymentDto {
  @ApiProperty({
    description: 'The optional name to describe the deployment.',
    nullable: true,
    maxLength: 100,
  })
  @IsOptional()
  @IsNumber()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'The ID of the service.',
    required: true,
  })
  @IsDefined()
  @IsNumber()
  serviceId: number;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsDefined()
  @IsObject()
  parameters: Record<string, any>;
}

export class UpdateDeploymentDto {
  @ApiProperty({
    description: 'The optional name to describe the deployment.',
    nullable: true,
    maxLength: 100,
  })
  @IsOptional()
  @IsNumber()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'The ID of the version when an update is made.',
    required: true,
  })
  @IsOptional()
  @IsNumber()
  versionId?: number;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class DeploymentDto {
  @ApiProperty({
    description: 'The ID of the deployment.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The ID of the service.',
    required: true,
  })
  serviceId: number;

  @ApiProperty({
    description: 'The name of the service.',
    required: true,
  })
  serviceName: string;

  @ApiProperty({
    description: 'The version of the service.',
    required: true,
  })
  serviceVersion: string;

  @ApiProperty({
    description: 'The timestamp when the deployment has been created.',
    required: true,
    type: 'string',
    format: 'date',
  })
  createdAt: Date;

  static fromDomain(source: Deployment) {
    const result = new DeploymentDto();
    result.id = source.id;
    result.serviceId = source.serviceId;
    result.serviceName = source.serviceName;
    result.serviceVersion = source.serviceVersion;
    result.createdAt = source.createdAt;
    return result;
  }
}

export class DeploymentsDto {
  @ApiProperty({
    description: 'The deployments.',
    required: true,
    type: [DeploymentDto],
  })
  items: DeploymentDto[];

  static fromDomain(source: Deployment[]) {
    const result = new DeploymentsDto();
    result.items = source.map(DeploymentDto.fromDomain);
    return result;
  }
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
    type: 'string',
  })
  resourceId: string;

  @ApiProperty({
    description: 'The type of the resource.',
    required: true,
    type: 'string',
  })
  resourceType: string;

  @ApiProperty({
    description: 'The name of the resource.',
    required: true,
    type: 'string',
  })
  resourceName: string;

  @ApiProperty({
    description: 'The workflows that have been created',
    required: true,
    type: [ResourceWorkloadStatusDto],
  })
  workloads: ResourceWorkloadStatusDto[] = [];

  static fromDomain(source: ResourceStatus) {
    const result = new ResourceStatusDto();
    result.resourceId = source.resourceId;
    result.resourceName = source.resourceName;
    result.resourceName = source.resourceType;
    result.workloads = source.workloads.map(ResourceWorkloadStatusDto.fromDomain);
    return result;
  }
}

export class DeploymentStatusDto {
  @ApiProperty({
    description: 'The resources',
    required: true,
    type: [ResourceStatusDto],
  })
  resources: ResourceStatusDto[] = [];

  static fromDomain(source: ResourceStatus[]) {
    const result = new DeploymentStatusDto();
    result.resources = source.map(ResourceStatusDto.fromDomain);
    return result;
  }
}
