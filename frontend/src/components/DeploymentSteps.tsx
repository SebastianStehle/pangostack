import { useQuery } from '@tanstack/react-query';
import { DeploymentStepDto, DeploymentSubStepDto, useClients } from 'src/api';
import { texts } from 'src/texts';

const ACTIVE_REFETCH_INTERVAL_MS = 3000;

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

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

const DeploymentStep = ({ step }: { step: DeploymentStepDto }) => {
  const isExpanded = step.status === 'Running' || step.status === 'Failed';

  return (
    <div className="card card-border bg-base border-slate-300">
      <div className="card-body py-4">
        <div className="flex items-center gap-3">
          <StepStatus status={step.status} />

          <div className="grow">
            <span className="badge badge-ghost badge-sm me-2 rounded-full font-normal">
              {step.action === 'Delete' ? texts.deployments.stepsDeleteAction : texts.deployments.stepsDeployAction}
            </span>
            {step.resourceName}
          </div>

          {step.attempt > 1 && (
            <div className="badge badge-warning badge-sm rounded-full">
              {texts.deployments.stepAttempt} {step.attempt}/{step.maxAttempts}
            </div>
          )}

          <div className="text-sm text-slate-500">{formatDuration(step.startedAt, step.completedAt)}</div>
        </div>

        {isExpanded && step.subSteps.length > 0 && <SubSteps subSteps={step.subSteps} />}

        {!isExpanded && step.subSteps.length > 0 && (
          <details>
            <summary className="cursor-pointer text-sm text-slate-500">{texts.common.more}</summary>

            <SubSteps subSteps={step.subSteps} />
          </details>
        )}

        {step.error && (
          <div role="alert" className="alert alert-error text-sm">
            {step.error}
          </div>
        )}
      </div>
    </div>
  );
};

const SubSteps = ({ subSteps }: { subSteps: DeploymentSubStepDto[] }) => {
  return (
    <div className="mt-2 border-l-2 border-gray-300 ps-4">
      {subSteps.map((subStep, i) => (
        <div className="my-1 flex items-center gap-2" key={i}>
          <StepStatus status={subStep.status} small />

          <div>{subStep.name}</div>

          {subStep.message && <div className="text-sm text-slate-500">{subStep.message}</div>}

          <div className="grow text-right text-sm text-slate-500">{formatDuration(subStep.startedAt, subStep.completedAt)}</div>
        </div>
      ))}
    </div>
  );
};

const StepStatus = ({ small, status }: { status: string; small?: boolean }) => {
  if (status === 'Running') {
    return <span className={`loading loading-spinner text-primary ${small ? 'loading-xs' : 'loading-sm'}`}></span>;
  }

  const size = small ? 'h-2 w-2' : 'h-3 w-3';
  if (status === 'Completed') {
    return <span className={`inline-flex ${size} rounded-full bg-green-600`}></span>;
  } else if (status === 'Failed') {
    return <span className={`inline-flex ${size} rounded-full bg-red-600`}></span>;
  } else {
    return <span className={`inline-flex ${size} rounded-full bg-gray-400`}></span>;
  }
};

function formatDuration(startedAt?: Date | string | null, completedAt?: Date | string | null) {
  if (!startedAt) {
    return null;
  }

  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();

  const totalSeconds = Math.max(0, Math.round((end - start) / MILLISECONDS_PER_SECOND));
  if (totalSeconds < SECONDS_PER_MINUTE) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return `${minutes}m ${seconds}s`;
}
