import { DeploymentSubStepDto } from 'src/api';
import { formatDuration } from 'src/lib';
import { DeploymentStatus } from './DeploymentStatus';

export interface DeploymentSubStepsProps {
  // The sub-steps to render.
  subSteps: DeploymentSubStepDto[];
}

export const DeploymentSubSteps = (props: DeploymentSubStepsProps) => {
  const { subSteps } = props;

  return (
    <div className="mt-2 border-l-2 border-gray-300 ps-4">
      {subSteps.map((subStep, i) => {
        const lastLog = subStep.logs[subStep.logs.length - 1];

        return (
          <div className="my-1 flex items-center gap-2" key={i}>
            <div className="flex w-4 flex-col items-center">
              <DeploymentStatus status={subStep.status} showLabel={false} small />
            </div>

            <div>{subStep.name}</div>

            {subStep.error ? (
              <div className="text-error text-sm">{subStep.error}</div>
            ) : (
              lastLog && <div className="text-sm text-slate-500">{lastLog.message}</div>
            )}

            <div className="grow text-right text-sm text-slate-500">{formatDuration(subStep.startedAt, subStep.completedAt)}</div>
          </div>
        );
      })}
    </div>
  );
};
