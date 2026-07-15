import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  ConnectionInfo,
  DeploymentCheckStatus,
  DeploymentStepAction,
  DeploymentStepStatus,
  DeploymentSubStep,
  DeploymentSubStepStatus,
  DeploymentUpdateStatus,
} from 'src/domain/database';
import {
  CheckSummary,
  Deployment,
  DeploymentResource,
  DeploymentUpdateStep,
  MetricDatapoint,
  MetricSeries,
  MetricSummary,
  ResourceInstanceLog,
  ResourceLog,
  ResourceNodeStatus,
  ResourceStatus,
  ResourceWorkloadStatus,
  UsageSummary,
} from 'src/domain/services';
import { DEPLOYMENT_STEP_MAX_ATTEMPTS } from 'src/domain/workflows/constants';

export class CreateDeploymentDto {
  @ApiProperty({
    description: 'The optional name to describe the deployment.',
    nullable: true,
    maxLength: 100,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

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
    type: String,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'The ID of the version when an update is made.',
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  versionId?: number | null;

  @ApiProperty({
    description: 'The parameters.',
    required: true,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;
}

export class ConnectionInfoDto {
  @ApiProperty({
    description: 'The connection value (URL, endpoint, etc.).',
    required: true,
  })
  value: string;

  @ApiProperty({
    description: 'Whether this connection is publicly accessible.',
    required: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Human-readable label for this connection.',
    required: true,
  })
  label: string;

  static fromDomain(source: ConnectionInfo): ConnectionInfoDto {
    const result = new ConnectionInfoDto();
    result.value = source.value;
    result.label = source.label;
    return result;
  }
}

export class DeploymentResourceDto {
  @ApiProperty({
    description: 'The ID of the resource.',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'The name of the resource.',
    required: true,
  })
  name: string;

  static fromDomain(source: DeploymentResource): DeploymentResourceDto {
    const result = new DeploymentResourceDto();
    result.id = source.id;
    result.name = source.name;
    return result;
  }
}

export class AvailableUpdateDto {
  @ApiProperty({
    description: 'The name of the version.',
    required: true,
  })
  name: string;

  static fromDomain(source: { name: string }): AvailableUpdateDto {
    const result = new AvailableUpdateDto();
    result.name = source.name;
    return result;
  }
}

@ApiExtraModels(AvailableUpdateDto)
@ApiExtraModels(ConnectionInfoDto)
export class DeploymentDto {
  @ApiProperty({
    description: 'The ID of the deployment.',
    required: true,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the deployment.',
    nullable: true,
    type: String,
  })
  name?: string | null;

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
    description: 'Indicates if the version is the default one.',
    required: true,
  })
  isVersionDefault: boolean;

  @ApiProperty({
    description: ' Indicates if the version is the last one.',
    required: true,
  })
  isVersionLast: boolean;

  @ApiProperty({
    description: 'The timestamp when the deployment has been created.',
    required: true,
    type: 'string',
    format: 'date',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The connection infos organized by connection type and name.',
    required: true,
    additionalProperties: {
      type: 'object',
      additionalProperties: {
        $ref: getSchemaPath(ConnectionInfoDto),
      },
    },
  })
  connections: Record<string, Record<string, ConnectionInfoDto>>;

  @ApiProperty({
    description: 'Instructions to follow after installation.',
    nullable: true,
  })
  afterInstallationInstructions?: string | null;

  @ApiProperty({
    description: 'The current status of the last deployment update.',
    required: true,
    enum: ['Pending', 'Running', 'Completed', 'Failed'],
  })
  status: DeploymentUpdateStatus;

  @ApiProperty({
    description: 'The current health status of the deployment.',
    nullable: true,
    type: String,
    enum: ['Succeeded', 'Failed'],
  })
  healthStatus?: DeploymentCheckStatus | null;

  @ApiProperty({
    description: 'The current deployment parameters.',
    required: true,
    additionalProperties: true,
  })
  parameters: Record<string, any>;

  @ApiProperty({
    description: 'The current resources.',
    required: true,
    type: [DeploymentResourceDto],
  })
  resources: DeploymentResourceDto[];

  @ApiProperty({
    description: 'The available updates.',
    required: true,
    type: [AvailableUpdateDto],
  })
  availableUpdates: AvailableUpdateDto[];

  static fromDomain(source: Deployment) {
    const result = new DeploymentDto();
    result.id = source.id;
    result.name = source.name;
    result.afterInstallationInstructions = source.afterInstallationInstructions;
    result.availableUpdates = source.availableUpdates.map(AvailableUpdateDto.fromDomain);
    result.connections = {};
    result.createdAt = source.createdAt;
    result.healthStatus = source.healthStatus;
    result.isVersionDefault = source.isVersionDefault;
    result.isVersionLast = source.isVersionLast;
    result.parameters = source.parameters;
    result.resources = source.resources.map(DeploymentResourceDto.fromDomain);
    result.serviceId = source.serviceId;
    result.serviceName = source.serviceName;
    result.serviceVersion = source.serviceVersion;
    result.status = source.status;

    for (const [connectionType, connections] of Object.entries(source.connections)) {
      result.connections[connectionType] = {};

      for (const [connectionName, connectionInfo] of Object.entries(connections)) {
        if (connectionInfo.isPublic) {
          result.connections[connectionType][connectionName] = ConnectionInfoDto.fromDomain(connectionInfo);
        }
      }
    }

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

  @ApiProperty({
    description: 'The total number of deployments.',
    required: true,
  })
  total: number;

  static fromDomain(source: Deployment[], total = 0) {
    const result = new DeploymentsDto();
    result.total = total;
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
    description: 'The resource I.',
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
    description: 'The workflows that have been create.',
    required: true,
    type: [ResourceWorkloadStatusDto],
  })
  workloads: ResourceWorkloadStatusDto[] = [];

  static fromDomain(source: ResourceStatus) {
    const result = new ResourceStatusDto();
    result.resourceId = source.resourceId;
    result.resourceName = source.resourceName;
    result.resourceType = source.resourceType;
    result.workloads = source.workloads.map(ResourceWorkloadStatusDto.fromDomain);
    return result;
  }
}

export class DeploymentStatusDto {
  @ApiProperty({
    description: 'The resource.',
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

export class DeploymentSubStepDto {
  @ApiProperty({
    description: 'The name of the sub-step.',
    required: true,
  })
  name: string;

  @ApiProperty({
    description: 'The status of the sub-step.',
    required: true,
    enum: ['Running', 'Completed', 'Failed'],
  })
  status: DeploymentSubStepStatus;

  @ApiProperty({
    description: 'The live message of the sub-step, for example the readiness progress.',
    nullable: true,
    type: String,
  })
  message?: string | null;

  @ApiProperty({
    description: 'When the sub-step was started.',
    required: true,
  })
  startedAt: string;

  @ApiProperty({
    description: 'When the sub-step was completed or failed.',
    nullable: true,
    type: String,
  })
  completedAt?: string | null;

  static fromDomain(source: DeploymentSubStep) {
    const result = new DeploymentSubStepDto();
    result.name = source.name;
    result.status = source.status;
    result.message = source.message;
    result.startedAt = source.startedAt;
    result.completedAt = source.completedAt;
    return result;
  }
}

export class DeploymentStepDto {
  @ApiProperty({
    description: 'The ID of the resource within the service definition.',
    required: true,
  })
  resourceId: string;

  @ApiProperty({
    description: 'The display name of the resource.',
    required: true,
  })
  resourceName: string;

  @ApiProperty({
    description: 'Whether the resource is deployed or deleted in this step.',
    required: true,
    enum: ['Deploy', 'Delete'],
  })
  action: DeploymentStepAction;

  @ApiProperty({
    description: 'The status of the step.',
    required: true,
    enum: ['Pending', 'Running', 'Completed', 'Failed'],
  })
  status: DeploymentStepStatus;

  @ApiProperty({
    description: 'The current attempt, greater than one when the step has been retried.',
    required: true,
  })
  attempt: number;

  @ApiProperty({
    description: 'The maximum number of attempts.',
    required: true,
  })
  maxAttempts: number;

  @ApiProperty({
    description: 'The error of the last failed attempt.',
    nullable: true,
    type: String,
  })
  error?: string | null;

  @ApiProperty({
    description: 'The sub-steps as reported by the worker.',
    required: true,
    type: [DeploymentSubStepDto],
  })
  subSteps: DeploymentSubStepDto[] = [];

  @ApiProperty({
    description: 'When the step was started.',
    nullable: true,
    type: Date,
  })
  startedAt?: Date | null;

  @ApiProperty({
    description: 'When the step was completed or failed.',
    nullable: true,
    type: Date,
  })
  completedAt?: Date | null;

  static fromDomain(source: DeploymentUpdateStep) {
    const result = new DeploymentStepDto();
    result.resourceId = source.resourceId;
    result.resourceName = source.resourceName;
    result.action = source.action;
    result.status = source.status;
    result.attempt = source.attempt;
    result.maxAttempts = DEPLOYMENT_STEP_MAX_ATTEMPTS;
    result.error = source.error;
    result.subSteps = source.subSteps.map(DeploymentSubStepDto.fromDomain);
    result.startedAt = source.startedAt;
    result.completedAt = source.completedAt;
    return result;
  }
}

export class DeploymentStepsDto {
  @ApiProperty({
    description: 'The steps of the most recent deployment update.',
    required: true,
    type: [DeploymentStepDto],
  })
  steps: DeploymentStepDto[] = [];

  static fromDomain(source: DeploymentUpdateStep[]) {
    const result = new DeploymentStepsDto();
    result.steps = source.map(DeploymentStepDto.fromDomain);
    return result;
  }
}

export class ResourceInstanceLogDto {
  @ApiProperty({
    description: 'The identifier for instances or kubernetes deployments.',
    required: true,
  })
  instanceId: string;

  @ApiProperty({
    description: 'The actual log message.',
    required: true,
  })
  messages: string;

  static fromDomain(source: ResourceInstanceLog) {
    const result = new ResourceInstanceLogDto();
    result.instanceId = source.instanceId;
    result.messages = source.messages;
    return result;
  }
}

export class ResourceLogsDto {
  @ApiProperty({
    description: 'The resource I.',
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
    description: 'The logs for the instances.',
    required: true,
    type: [ResourceInstanceLogDto],
  })
  instances: ResourceInstanceLogDto[] = [];

  static fromDomain(source: ResourceLog) {
    const result = new ResourceLogsDto();
    result.resourceId = source.resourceId;
    result.resourceName = source.resourceName;
    result.resourceType = source.resourceType;
    result.instances = source.instances.map(ResourceInstanceLogDto.fromDomain);
    return result;
  }
}

export class DeploymentLogsDto {
  @ApiProperty({
    description: 'The resource.',
    required: true,
    type: [ResourceLogsDto],
  })
  resources: ResourceLogsDto[] = [];

  static fromDomain(source: ResourceLog[]) {
    const result = new DeploymentLogsDto();
    result.resources = source.map(ResourceLogsDto.fromDomain);
    return result;
  }
}

export class DeploymentCheckSummaryDto {
  @ApiProperty({
    description: 'The date for which the summary has been create.',
    required: true,
  })
  date: string;

  @ApiProperty({
    description: 'The total number of failures on this dat.',
    required: true,
  })
  totalFailures: number;

  @ApiProperty({
    description: 'The total number of successes on this dat.',
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
    description: 'The summary per dat.',
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
    description: 'The date for which the summary has been create.',
    required: true,
  })
  date: string;

  @ApiProperty({
    description: 'The total cores at the specified dat.',
    required: true,
  })
  totalCores: number;

  @ApiProperty({
    description: 'The total memory at the specified date (in GB.',
    required: true,
  })
  totalMemoryGB: number;

  @ApiProperty({
    description: 'The total volume at the specified date (in GB.',
    required: true,
  })
  totalVolumeGB: number;

  @ApiProperty({
    description: 'The total storage at the specified date (in GB.',
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
    description: 'The usage summary per dat.',
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

export class DeploymentMetricDatapointDto {
  @ApiProperty({
    description: 'The timestamp when the metric has been collected.',
    required: true,
  })
  timestamp: string;

  @ApiProperty({
    description: 'The collected values, for example { used: 4, total: 8 }.',
    required: true,
    additionalProperties: {
      type: 'number',
    },
  })
  values: Record<string, number>;

  static fromDomain(source: MetricDatapoint): DeploymentMetricDatapointDto {
    return Object.assign(new DeploymentMetricDatapointDto(), source);
  }
}

export class DeploymentMetricSummaryDto {
  @ApiProperty({
    description: 'The display label of the summary.',
    required: true,
  })
  label: string;

  @ApiProperty({
    description: 'How the values are aggregated.',
    required: true,
    enum: ['avg', 'max'],
  })
  type: 'avg' | 'max';

  @ApiProperty({
    description: 'The mapping prefix that the summary is based on.',
    required: true,
  })
  prefix: string;

  @ApiProperty({
    description: 'The optional value name to select a single value under the prefix.',
    nullable: true,
    type: String,
  })
  value?: string | null;

  static fromDomain(source: MetricSummary): DeploymentMetricSummaryDto {
    return Object.assign(new DeploymentMetricSummaryDto(), source);
  }
}

export class DeploymentMetricSeriesDto {
  @ApiProperty({
    description: 'The key of the metric from the definition.',
    required: true,
  })
  key: string;

  @ApiProperty({
    description: 'The display label of the metric.',
    required: true,
  })
  label: string;

  @ApiProperty({
    description: 'The unit of the metric.',
    nullable: true,
    type: String,
  })
  unit?: string | null;

  @ApiProperty({
    description: 'How the metric should be displayed.',
    required: true,
    enum: ['label', 'bar'],
  })
  chart: 'label' | 'bar';

  @ApiProperty({
    description: 'The summaries that are shown as cards in the UI.',
    required: true,
    type: [DeploymentMetricSummaryDto],
  })
  summaries: DeploymentMetricSummaryDto[] = [];

  @ApiProperty({
    description: 'The collected datapoints, ordered by timestamp.',
    required: true,
    type: [DeploymentMetricDatapointDto],
  })
  datapoints: DeploymentMetricDatapointDto[] = [];

  static fromDomain(source: MetricSeries): DeploymentMetricSeriesDto {
    return Object.assign(new DeploymentMetricSeriesDto(), {
      ...source,
      datapoints: source.datapoints.map(DeploymentMetricDatapointDto.fromDomain),
      summaries: source.summaries.map(DeploymentMetricSummaryDto.fromDomain),
    });
  }
}

export class DeploymentMetricsDto {
  @ApiProperty({
    description: 'The metrics with their datapoints.',
    required: true,
    type: [DeploymentMetricSeriesDto],
  })
  metrics: DeploymentMetricSeriesDto[] = [];

  static fromDomain(source: MetricSeries[]): DeploymentMetricsDto {
    return Object.assign(new DeploymentMetricsDto(), { metrics: source.map(DeploymentMetricSeriesDto.fromDomain) });
  }
}

export class DeploymentCreatedDto {
  @ApiProperty({
    description: 'The created deployment.',
    nullable: true,
    type: DeploymentDto,
  })
  deployment?: DeploymentDto | null;

  @ApiProperty({
    description: 'The redirect URL if the deployment cannot be completed automatically.',
    nullable: true,
    type: String,
  })
  redirectUrl?: string | null;
}
