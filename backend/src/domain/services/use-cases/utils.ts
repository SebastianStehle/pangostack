import { DeploymentEntity, ServiceEntity, ServiceVersionEntity } from 'src/domain/database';
import { Deployment, Service, ServicePublic, ServiceVersion } from '../interfaces';
import { ServiceDefinition } from '../workflows/model';

export function buildDeployment(source: DeploymentEntity, service: ServiceEntity): Deployment {
  const { id } = source;

  return { id, serviceName: service.name, serviceId: service.id };
}

export function buildServiceVersion(source: ServiceVersionEntity): ServiceVersion {
  const { id, definition, environment, isActive, name } = source;

  const handledDeployments = new Set<number>();
  for (const update of source.deploymentUpdates) {
    handledDeployments.add(update.deploymentId);
  }

  return { id, definition, environment, isActive, name, numDeployments: handledDeployments.size };
}

export function buildServicePublic(
  source: ServiceEntity,
  version: ServiceVersionEntity,
  definition: ServiceDefinition,
): ServicePublic {
  const {
    id,
    currency,
    description,
    fixedPrice,
    name,
    pricePerCpuHour,
    pricePerDiskGbHour,
    pricePerMemoryGbHour,
    pricePerStorageGbHour,
  } = source;

  return {
    id,
    currency,
    description,
    fixedPrice,
    name,
    parameters: definition.parameters,
    pricePerCpuHour,
    pricePerDiskGbHour,
    pricePerMemoryGbHour,
    pricePerStorageGbHour,
    version: version.name,
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
    pricePerCpuHour,
    pricePerDiskGbHour,
    pricePerMemoryGbHour,
    pricePerStorageGbHour,
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
    latestVersion: versions.sort((x) => x.order)[0]?.name,
    name,
    numDeployments: handledDeployments.size,
    pricePerCpuHour,
    pricePerDiskGbHour,
    pricePerMemoryGbHour,
    pricePerStorageGbHour,
  };
}
