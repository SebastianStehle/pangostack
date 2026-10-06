import { DeploymentUpdateEntity } from 'src/domain/database';
import { ResourceDefinition } from 'src/domain/definitions';

export function getEvaluationContext(update: DeploymentUpdateEntity) {
  const definition = update.serviceVersion.definition;
  const context = { env: update.environment, context: update.context, parameters: update.parameters };

  return { definition, context };
}

// Every resource that Pangostack provisions is named after the deployment it belongs to. The prefix
// is what makes a resource recognizable as ours when a cloud account is enumerated again, therefore
// the builder and the parser live next to each other and must never drift apart.
export const RESOURCE_UNIQUE_ID_PREFIX = 'deployment_';

export function getResourceUniqueId(deploymentId: number, resource: ResourceDefinition) {
  return `${RESOURCE_UNIQUE_ID_PREFIX}${deploymentId}_${resource.id}`;
}

// Returns null for anything that was not created by Pangostack, so that foreign resources in the
// same cloud account are never mistaken for one of our own.
export function parseResourceUniqueId(resourceUniqueId: string) {
  if (!resourceUniqueId.startsWith(RESOURCE_UNIQUE_ID_PREFIX)) {
    return null;
  }

  const remainder = resourceUniqueId.slice(RESOURCE_UNIQUE_ID_PREFIX.length);
  const separator = remainder.indexOf('_');
  if (separator <= 0) {
    return null;
  }

  const deploymentId = Number(remainder.slice(0, separator));
  const resourceId = remainder.slice(separator + 1);

  if (!Number.isInteger(deploymentId) || deploymentId <= 0 || !resourceId) {
    return null;
  }

  return { deploymentId, resourceId };
}

export function updateContext(resourceId: string, context: Record<string, any>, values?: Record<string, any>) {
  if (!values) {
    return;
  }

  for (const [key, value] of Object.entries(values)) {
    const global = (context.global ||= {});
    global[key] = value;

    const local = (context[resourceId] ||= {});
    local[key] = value;
  }
}
