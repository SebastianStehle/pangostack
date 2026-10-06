import { OrphanedResourceStatus } from 'src/domain/database';

export interface OrphanedResource {
  id: number;
  resourceUniqueId: string;
  resourceType: string;
  serviceVersionId: number;
  resourceDefinitionId: string;
  detectedAt: Date;
  lastSeenAt: Date;
  status: OrphanedResourceStatus;
  resolvedAt: Date | null;
}

export interface CurrentDeploymentResources {
  resourceIds: Set<string>;
  updatedAt: Date;
}
