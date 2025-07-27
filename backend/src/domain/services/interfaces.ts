import { ParameterDefinition } from './workflows/model';

export interface Deployment {
  // The ID of the deployment.
  id: number;

  // The ID of the service.
  serviceId: number;

  // The name of the service.
  serviceName: string;
}

export interface ServiceVersion {
  // The ID of the service version.
  id: number;

  // The name of the version.
  name: string;

  // The YAML definition.
  definition: string;

  // The environment settings.
  environment: Record<string, string>;

  // Indicates if the version is active.
  isActive: boolean;

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
  environment: Record<string, string>;

  // The currency.
  currency: string;

  // The price per CPU and hour in the selected currency.
  pricePerCpuHour: number;

  // The price per Memory in GB and hour in the selected currency.
  pricePerMemoryGbHour: number;

  // The price per Storage in GB and hour in the selected currency.
  pricePerStorageGbHour: number;

  // The price per Disk in GB and hour in the selected currency.
  pricePerDiskGbHour: number;

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

  // The price per CPU and hour in the selected currency.
  pricePerCpuHour: number;

  // The price per Memory in GB and hour in the selected currency.
  pricePerMemoryGbHour: number;

  // The price per Storage in GB and hour in the selected currency.
  pricePerStorageGbHour: number;

  // The price per Disk in GB and hour in the selected currency.
  pricePerDiskGbHour: number;

  // The additional fixed price.
  fixedPrice: number;

  // The parameters.
  parameters: ParameterDefinition[];
}
