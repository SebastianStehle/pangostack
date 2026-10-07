import { ParsedResourceUniqueId } from 'src/lib';
import { CurrentDeploymentResources } from './interfaces';

export function isOrphanedResource(
  resource: ParsedResourceUniqueId | null,
  deployments: Map<number, CurrentDeploymentResources>,
  graceCutoff: Date,
) {
  // Deliberately conservative, because a wrong finding is cheap and a wrong deletion is not.
  if (!resource) {
    // Not created by this installation. Foreign resources in the same cloud account are never touched.
    return false;
  }

  const deployment = deployments.get(resource.deploymentId);
  if (!deployment) {
    return true;
  }

  if (deployment.resourceIds.has(resource.resourceId)) {
    return false;
  }

  // The resource was dropped from the definition. A version change that is still rolling out must not
  // be reported, therefore only updates that settled before the grace period count.
  return deployment.updatedAt < graceCutoff;
}
