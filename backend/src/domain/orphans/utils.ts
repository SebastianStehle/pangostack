import { parseResourceUniqueId } from 'src/domain/services';
import { CurrentDeploymentResources } from './interfaces';

export function isOrphanedResource(
  resourceUniqueId: string,
  deployments: Map<number, CurrentDeploymentResources>,
  graceCutoff: Date,
) {
  // Deliberately conservative, because a wrong finding is cheap and a wrong deletion is not.
  const parsed = parseResourceUniqueId(resourceUniqueId);
  if (!parsed) {
    // Not created by Pangostack. Foreign resources in the same cloud account are never touched.
    return false;
  }

  const deployment = deployments.get(parsed.deploymentId);
  if (!deployment) {
    return true;
  }

  if (deployment.resourceIds.has(parsed.resourceId)) {
    return false;
  }

  // The resource was dropped from the definition. A version change that is still rolling out must not
  // be reported, therefore only updates that settled before the grace period count.
  return deployment.updatedAt < graceCutoff;
}
