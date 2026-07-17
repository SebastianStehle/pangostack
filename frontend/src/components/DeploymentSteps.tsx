import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { texts } from 'src/texts';
import { DeploymentStep } from './DeploymentStep';

const ACTIVE_REFETCH_INTERVAL_MS = 3000;

export interface DeploymentStepsProps {
  // The deployment to show the steps for.
  deploymentId: number;

  // Enables polling while the deployment is running.
  isActive: boolean;
}

export const DeploymentSteps = (props: DeploymentStepsProps) => {
  const { deploymentId, isActive } = props;
  const clients = useClients();

  const { data: loadedSteps } = useQuery({
    queryKey: ['deployment-steps', deploymentId],
    queryFn: () => clients.deployments.getDeploymentSteps(deploymentId),
    refetchInterval: isActive ? ACTIVE_REFETCH_INTERVAL_MS : false,
  });

  const steps = loadedSteps?.steps || [];
  if (steps.length === 0) {
    return null;
  }

  const completed = steps.filter((x) => x.status === 'Completed').length;

  return (
    <div>
      {isActive && (
        <div className="mb-4">
          <progress className="progress progress-primary w-full" value={completed} max={steps.length} />

          <div className="text-sm">{texts.deployments.stepsProgress(completed, steps.length)}</div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {steps.map((step) => (
          <DeploymentStep key={`${step.action}-${step.resourceId}`} step={step} />
        ))}
      </div>
    </div>
  );
};
