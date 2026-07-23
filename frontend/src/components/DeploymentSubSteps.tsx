import { DeploymentSubStepDto } from 'src/api';
import { formatDuration } from 'src/lib';
import { DeploymentStepStatus } from './DeploymentStepStatus';

export const DeploymentSubSteps = ({ subSteps }: { subSteps: DeploymentSubStepDto[] }) => {
  return (
    <div className="mt-2 border-l-2 border-gray-300 ps-4">
      {subSteps.map((subStep, i) => {
        const lastLog = subStep.logs[subStep.logs.length - 1];

        return (
          <div className="my-1 flex items-center gap-2" key={i}>
            <DeploymentStepStatus status={subStep.status} small />

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
