import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsObject, IsOptional, MaxLength } from 'class-validator';
import {
  CheckSummary,
  Deployment,
  ResourceNodeStatus,
  ResourceStatus,
  ResourceWorkloadStatus,
  UsageSummary,
} from 'src/domain/services';

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

  @ApiProperty({
    description: 'The URL to call after the deployment has been created.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  confirmUrl?: string | null;

  @ApiProperty({
    description: 'The URL to call after the deployment has been cancelled.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  cancelUrl?: string | null;
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

export class DeploymentCreatedDto {
  @ApiProperty({
    description: 'The created deployment.',
    nullable: true,
  })
  deployment?: DeploymentDto | null;

  @ApiProperty({
    description: 'The redirect URL if the deployment cannot be completed automatically.',
    nullable: true,
    type: String,
  })
  redirectUrl?: string | null;
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

export class DeploymentCheckSummaryDto {
  @ApiProperty({
    description: 'The date for which the summary has been created',
    required: true,
  })
  date: string;

  @ApiProperty({
    description: 'The total number of failures on this date',
    required: true,
  })
  totalFailures: number;

  @ApiProperty({
    description: 'The total number of successes on this date',
    required: true,
  })
  totalSuccesses: number;

  static fromDomain(source: CheckSummary) {
    const result = new DeploymentCheckSummaryDto();
    result.date = source.date;
    result.totalFailures = source.totalFailures;
    result.totalSuccesses = source.totalSuccesses;
    return result;
  }
}

export class DeploymentCheckSummariesDto {
  @ApiProperty({
    description: 'The summary per date',
    required: true,
    type: [DeploymentCheckSummaryDto],
  })
  checks: DeploymentCheckSummaryDto[] = [];

  static fromDomain(source: CheckSummary[]) {
    const result = new DeploymentCheckSummariesDto();
    result.checks = source.map(DeploymentCheckSummaryDto.fromDomain);
    return result;
  }
}

export class DeploymentUsageSummaryDto {
  @ApiProperty({
    description: 'The date for which the summary has been created',
    required: true,
  })
  date: string;

  @ApiProperty({
    description: 'The total cores at the specified date',
    required: true,
  })
  totalCores: number;

  @ApiProperty({
    description: 'The total memory at the specified date (in GB)',
    required: true,
  })
  totalMemoryGB: number;

  @ApiProperty({
    description: 'The total volume at the specified date (in GB)',
    required: true,
  })
  totalVolumeGB: number;

  @ApiProperty({
    description: 'The total storage at the specified date (in GB)',
    required: true,
  })
  totalStorageGB: number;

  static fromDomain(source: UsageSummary): DeploymentUsageSummaryDto {
    const result = new DeploymentUsageSummaryDto();
    result.date = source.date;
    result.totalCores = source.totalCores;
    result.totalMemoryGB = source.totalMemoryGB;
    result.totalVolumeGB = source.totalVolumeGB;
    result.totalStorageGB = source.totalStorageGB;
    return result;
  }
}

export class DeploymentUsageSummariesDto {
  @ApiProperty({
    description: 'The usage summary per date',
    required: true,
    type: [DeploymentUsageSummaryDto],
  })
  summaries: DeploymentUsageSummaryDto[] = [];

  static fromDomain(source: UsageSummary[]): DeploymentUsageSummariesDto {
    const result = new DeploymentUsageSummariesDto();
    result.summaries = source.map(DeploymentUsageSummaryDto.fromDomain);
    return result;
  }
}
