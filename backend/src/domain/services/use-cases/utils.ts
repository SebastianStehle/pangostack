import {
  DeploymentCheckEntity,
  DeploymentEntity,
  DeploymentUpdateEntity,
  ServiceEntity,
  ServiceVersionEntity,
} from 'src/domain/database';
import { Deployment, Service, ServicePublic, ServiceVersion } from '../interfaces';

export function buildDeployment(
  source: DeploymentEntity,
  lastUpdate: DeploymentUpdateEntity,
  lastCheck?: DeploymentCheckEntity | null,
): Deployment {
  const { id, createdAt } = source;

  return {
    id,
    afterInstallationInstructions: lastUpdate.serviceVersion.definition.afterInstallationInstructions,
    connections: lastUpdate.resourceConnections,
    createdAt,
    healthStatus: lastCheck?.status,
    name: source.name,
    isVersionDefault: lastUpdate.serviceVersion.isActive,
    isVersionLast: false,
    parameters: lastUpdate.parameters,
    resources: lastUpdate.serviceVersion.definition.resources,
    serviceId: lastUpdate.serviceVersion.service.id,
    serviceName: lastUpdate.serviceVersion.service.name,
    serviceVersion: lastUpdate.serviceVersion.name,
    status: lastUpdate.status,
  };
}

export function buildServiceVersion(source: ServiceVersionEntity, isDefault: boolean): ServiceVersion {
  const { id, definition, definitionSource, environment, isActive, name } = source;

  const handledDeployments = new Set<number>();
  if (source.deploymentUpdates) {
    for (const update of source.deploymentUpdates) {
      handledDeployments.add(update.deploymentId);
    }
  }

  return { id, definition, definitionSource, environment, isActive, isDefault, name, numDeployments: handledDeployments.size };
}

export function buildServicePublic(source: ServiceEntity, serviceVersion?: ServiceVersionEntity | null): ServicePublic {
  const {
    id,
    currency,
    description,
    fixedPrice,
    name,
    pricePerCoreHour,
    pricePerVolumeGBHour,
    pricePerMemoryGBHour,
    pricePerStorageGBMonth,
  } = source;

  const definition = serviceVersion?.definition;

  return {
    id,
    afterInstallationInstructions: definition?.afterInstallationInstructions || '',
    currency,
    description,
    fixedPrice,
    isPreRelease: !definition,
    name,
    parameters: definition?.parameters || [],
    pricePerCoreHour,
    pricePerMemoryGBHour,
    pricePerStorageGBMonth,
    pricePerVolumeGBHour: pricePerVolumeGBHour,
    prices: definition?.prices || [],
    pricingModel: definition?.pricingModel || 'fixed',
    usage: definition?.usage,
    version: serviceVersion?.name || '',
  };
}

export function buildService(source: ServiceEntity): Service {
  const {
    id,
    currency,
    description,
    environment,
    fixedPrice,
    isPublic,
    name,
    pricePerCoreHour,
    pricePerVolumeGBHour,
    pricePerMemoryGBHour,
    pricePerStorageGBMonth,
  } = source;

  const versions = source.versions || [];

  const handledDeployments = new Set<number>();
  for (const version of versions) {
    for (const update of version.deploymentUpdates) {
      handledDeployments.add(update.deploymentId);
    }
  }

  return {
    id,
    currency,
    description,
    environment,
    fixedPrice,
    isActive: !!versions.find((x) => x.isActive),
    isPublic,
    latestVersion: versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.name,
    name,
    numDeployments: handledDeployments.size,
    pricePerCoreHour,
    pricePerVolumeGBHour,
    pricePerMemoryGBHour,
    pricePerStorageGBMonth,
  };
}
