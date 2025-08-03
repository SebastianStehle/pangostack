import { DeploymentEntity, DeploymentUpdateEntity, ServiceEntity, ServiceVersionEntity } from 'src/domain/database';
import { Deployment, Service, ServicePublic, ServiceVersion } from '../interfaces';

export function buildDeployment(source: DeploymentEntity, update: DeploymentUpdateEntity): Deployment {
  const { id, createdAt } = source;
  const service = update.serviceVersion.service;

  return { id, serviceName: service.name, serviceId: service.id, serviceVersion: update.serviceVersion.name, createdAt };
}

export function buildServiceVersion(source: ServiceVersionEntity, isDefault: boolean): ServiceVersion {
  const { id, definition, environment, isActive, name } = source;

  const handledDeployments = new Set<number>();
  if (source.deploymentUpdates) {
    for (const update of source.deploymentUpdates) {
      handledDeployments.add(update.deploymentId);
    }
  }

  return { id, definition, environment, isActive, isDefault, name, numDeployments: handledDeployments.size };
}

export function buildServicePublic(source: ServiceEntity, version: ServiceVersionEntity): ServicePublic {
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

  return {
    id,
    currency,
    description,
    fixedPrice,
    name,
    parameters: version.definition.parameters,
    pricePerCoreHour,
    pricePerVolumeGBHour: pricePerVolumeGBHour,
    pricePerMemoryGBHour,
    pricePerStorageGBMonth,
    version: version.name,
    usage: version.definition.usage,
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
