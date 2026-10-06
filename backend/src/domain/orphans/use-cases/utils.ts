import { OrphanedResourceEntity } from 'src/domain/database';
import { OrphanedResource } from '../interfaces';

export function buildOrphanedResource(source: OrphanedResourceEntity): OrphanedResource {
  const {
    detectedAt,
    id,
    lastSeenAt,
    resolvedAt,
    resourceDefinitionId,
    resourceType,
    resourceUniqueId,
    serviceVersionId,
    status,
  } = source;

  return {
    detectedAt,
    id,
    lastSeenAt,
    resolvedAt,
    resourceDefinitionId,
    resourceType,
    resourceUniqueId,
    serviceVersionId,
    status,
  };
}
