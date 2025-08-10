import { ConnectionInfo, DeploymentCheckStatus, DeploymentUpdateStatus } from '../database';
import { ParameterDefinition, ServiceDefinition, ServicePricingModel, UsageDefinition } from '../definitions';

export interface Deployment {
  // The ID of the deployment.
  id: number;

  // The name of the deployment.
  name?: string | null;

  // The connection infos.
  connections: Record<string, Record<string, ConnectionInfo>>;

  // The installation instructions.
  afterInstallationInstructions?: string | null;

  // The current status of the last update.
  status: DeploymentUpdateStatus;

  // The current status of the last update.
  healthStatus?: DeploymentCheckStatus;

  // The resources.
  resources: DeploymentResource[];

  // The current parameters.
  parameters: Record<string, any>;

  // The ID of the service.
  serviceId: number;

  // The name of the service.
  serviceName: string;

  // The version of the service.
  serviceVersion: string;

  // When the service has been created.
  createdAt: Date;
}

export interface DeploymentResource {
  // The ID of the resource.
  id: string;

  // The name of the resource.
  name: string;
}

export interface ServiceVersion {
  // The ID of the service version.
  id: number;

  // The name of the version.
  name: string;

  // The YAML definition.
  definition: ServiceDefinition;

  // The environment settings.
  environment: Record<string, string>;

  // Indicates if the version is active.
  isActive: boolean;

  // Indicates if the version is the default.
  isDefault: boolean;

  // The number of deployments.
  numDeployments: number;
}

export interface Service {
  // The ID of the service.
  id: number;

  // The name of the service.
  name: string;

  // The description.
  description: string;

  // The number of deployments.
  numDeployments: number;

  // The lastest version.
  latestVersion?: string;

  // The environment settings.
  environment?: Record<string, string>;

  // The currency.
  currency: string;

  // The price per Core and hour in the selected currency.
  pricePerCoreHour: number;

  // The price per Memory in GB and hour in the selected currency.
  pricePerMemoryGBHour: number;

  // The price per Storage in GB and hour in the selected currency.
  pricePerStorageGBMonth: number;

  // The price per Disk in GB and hour in the selected currency.
  pricePerVolumeGBHour: number;

  // The additional fixed price.
  fixedPrice: number;

  // Indicates if the service is active (has at least one active version).
  isActive: boolean;

  // Indicates if the service is public.
  isPublic: boolean;
}

export interface ServicePublic {
  // The ID of the service.
  id: number;

  // The name of the service.
  name: string;

  // The description.
  description: string;

  // The lastest version.
  version: string;

  // The currency.
  currency: string;

  // The prices.
  prices?: ServicePrice[];

  // The pricing model.
  pricingModel: ServicePricingModel;

  // The instructions to show after the installation has been made.
  afterInstallationInstructions?: string | null;

  // The price per Core and hour in the selected currency.
  pricePerCoreHour: number;

  // The price per Memory in GB and hour in the selected currency.
  pricePerMemoryGBHour: number;

  // The price per Storage in GB and hour in the selected currency.
  pricePerStorageGBMonth: number;

  // The price per Disk in GB and hour in the selected currency.
  pricePerVolumeGBHour: number;

  // The additional fixed price.
  fixedPrice: number;

  // The parameters.
  parameters: ParameterDefinition[];

  // The usage definition.
  usage: UsageDefinition;
}

export interface ServicePrice {
  // The target value.
  target: string;

  // The test value.
  test: string;

  // The total amount in the currency of the service.
  amount: number;
}

export interface ResourceNodeStatus {
  // The name of the node.
  name: string;

  // Indicates if the node can be used.
  isReady: boolean;

  // The message to describe the status.
  message?: string | null;
}

export interface ResourceWorkloadStatus {
  // The name of the workload.
  name: string;

  // All nodes within the workload.
  nodes: ResourceNodeStatus[];
}

export interface ResourceStatus {
  // The name of the resource.
  resourceId: string;

  // The type of the resource.
  resourceType: string;

  // The name of the resource.
  resourceName: string;

  // The workflows that have been created.
  workloads: ResourceWorkloadStatus[];
}

export interface CheckSummary {
  // The date for which the summary has been created.
  date: string;

  // The total number of failures on this date.
  totalFailures: number;

  // The total number of successes on this date.
  totalSuccesses: number;
}

export interface UsageSummary {
  // The date for which the summary has been created.
  date: string;

  // The total cores at the specified date.
  totalCores: number;

  // The total memory at the specified date.
  totalMemoryGB: number;

  // The total volume at the specified date.
  totalVolumeGB: number;

  // The total storage at this date.
  totalStorageGB: number;
}

export interface ResourceInstanceLog {
  // The identifier for instances or kubernetes deployments.
  instanceId: string;

  // The actual log message.
  messages: string;
}

export interface ResourceLog {
  // The name of the resource.
  resourceId: string;

  // The type of the resource.
  resourceType: string;

  // The name of the resource.
  resourceName: string;

  // The logs for the instances.
  instances: ResourceInstanceLog[];
}
