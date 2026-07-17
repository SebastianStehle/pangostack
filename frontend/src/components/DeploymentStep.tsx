import { DeploymentStepDto } from 'src/api';
import { formatDuration } from 'src/lib';
import { texts } from 'src/texts';
import { DeploymentStepStatus } from './DeploymentStepStatus';
import { DeploymentSubSteps } from './DeploymentSubSteps';

export const DeploymentStep = ({ step }: { step: DeploymentStepDto }) => {
  // Running or failed steps are always expanded so the relevant details are visible immediately.
  const isExpanded = step.status === 'Running' || step.status === 'Failed';
  const hasSubSteps = step.subSteps.length > 0;

  return (
    <div className="card card-border bg-base border-gray-300">
      <div className="card-body py-4">
        <div className="flex items-center gap-3">
          <DeploymentStepStatus status={step.status} />

          <div className="flex grow items-center gap-1">
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

        {hasSubSteps &&
          (isExpanded ? (
            <DeploymentSubSteps subSteps={step.subSteps} />
          ) : (
            <details>
              <summary className="cursor-pointer text-sm text-slate-500">{texts.common.more}</summary>
              w
              <DeploymentSubSteps subSteps={step.subSteps} />
            </details>
          ))}

        {step.error && (
          <div role="alert" className="alert alert-error text-sm">
            {step.error}
          </div>
        )}
      </div>
    </div>
  );
};
