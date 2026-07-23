import { useQuery } from '@tanstack/react-query';
import { DeploymentDto, ResourceStatusDto, useClients } from 'src/api';
import { texts } from 'src/texts';
import { DeploymentResource } from './DeploymentResource';

const ACTIVE_REFETCH_INTERVAL_MS = 3000;

export interface DeploymentResourcesProps {
  // The deployment to show the resources for.
  deployment: DeploymentDto;

  // The live status per resource.
  status: ResourceStatusDto[];

  // Indicates that the live status is still being loaded.
  statusLoading: boolean;

  // Enables polling while the deployment is running.
  isActive: boolean;
}

export const DeploymentResources = (props: DeploymentResourcesProps) => {
  const { deployment, isActive, status, statusLoading } = props;
  const clients = useClients();

  const { data: loadedSteps } = useQuery({
    queryKey: ['deployment-steps', deployment.id],
    queryFn: () => clients.deployments.getDeploymentSteps(deployment.id),
    refetchInterval: isActive ? ACTIVE_REFETCH_INTERVAL_MS : false,
  });

  const steps = loadedSteps?.steps || [];
  const completed = steps.filter((x) => x.status === 'Completed').length;

  // A resource is essentially a deployment step, so both lists are merged into one. Steps keep the
  // deployment order and resources without a matching step are appended so nothing is hidden.
  const stepResourceIds = new Set(steps.map((x) => x.resourceId));
  const rows = [
    ...steps.map((step) => ({
      key: `${step.action}-${step.resourceId}`,
      name: step.resourceName,
      resourceId: step.resourceId,
      step,
    })),
    ...deployment.resources
      .filter(({ id }) => !stepResourceIds.has(id))
      .map(({ id, name }) => ({ key: id, name, resourceId: id, step: undefined })),
  ];

  return (
    <div className="flex flex-col gap-4">
      {isActive && steps.length > 0 && (
        <div>
          <progress className="progress progress-primary w-full" value={completed} max={steps.length} />

          <div className="text-sm">{texts.deployments.stepsProgress(completed, steps.length)}</div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {rows.map(({ key, name, resourceId, step }) => (
          <DeploymentResource
            key={key}
            name={name}
            step={step}
            status={status.find((x) => x.resourceId === resourceId)}
            statusLoading={statusLoading}
            connection={deployment.connections[resourceId]}
          />
        ))}
      </div>
    </div>
  );
};
