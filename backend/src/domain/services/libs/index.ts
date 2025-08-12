import { DeploymentUpdateEntity } from 'src/domain/database';
import { ResourceDefinition } from 'src/domain/definitions';

export function getEvaluationContext(update: DeploymentUpdateEntity) {
  const definition = update.serviceVersion.definition;
  const context = { env: update.environment, context: update.context, parameters: update.parameters };

  return { definition, context };
}

export function getResourceUniqueId(deploymentId: number, resource: ResourceDefinition) {
  return `deployment_${deploymentId}_${resource.id}`;
}
