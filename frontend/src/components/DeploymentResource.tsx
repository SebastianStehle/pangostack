import { ConnectionInfoDto, DeploymentStepDto, ResourceStatusDto } from 'src/api';
import { NodeStatus } from 'src/components';
import { formatDuration } from 'src/lib';
import { texts } from 'src/texts';
import { DeploymentStepStatus } from './DeploymentStepStatus';
import { DeploymentSubSteps } from './DeploymentSubSteps';

export interface DeploymentResourceProps {
  // The name of the resource.
  name: string;

  // The step that deploys or removes the resource, if the deployment reported any.
  step?: DeploymentStepDto;

  // The connection infos.
  connection?: Record<string, ConnectionInfoDto>;

  // The live status.
  status?: ResourceStatusDto;
}

export const DeploymentResource = (props: DeploymentResourceProps) => {
  const { connection, name, status, step } = props;
  const actualConnections = connection || {};

  // Running or failed steps are always expanded so the relevant details are visible immediately.
  const isExpanded = step?.status === 'Running' || step?.status === 'Failed';
  const hasSubSteps = !!step && step.subSteps.length > 0;

  return (
    <div className="card card-border bg-base border-gray-300">
      <div className="card-body">
        <div className="flex items-center gap-3">
          {step && <DeploymentStepStatus status={step.status} />}

          {step && (
            <span className="badge badge-ghost badge-sm rounded-full font-normal">
              {step.action === 'Delete' ? texts.deployments.stepsDeleteAction : texts.deployments.stepsDeployAction}
            </span>
          )}

          <h3 className="card-title grow">{name}</h3>

          {step && step.attempt > 1 && (
            <div className="badge badge-warning badge-sm rounded-full">
              {texts.deployments.stepAttempt} {step.attempt}/{step.maxAttempts}
            </div>
          )}

          {step && <div className="text-sm text-slate-500">{formatDuration(step.startedAt, step.completedAt)}</div>}
        </div>

        {Object.keys(actualConnections).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(actualConnections).map(([key, value]) => (
              <div key={key}>
                {value.label}: {value.value}
              </div>
            ))}
          </div>
        )}

        {hasSubSteps &&
          (isExpanded ? (
            <DeploymentSubSteps subSteps={step.subSteps} />
          ) : (
            <details>
              <summary className="cursor-pointer text-sm text-slate-500">{texts.common.more}</summary>
              <DeploymentSubSteps subSteps={step.subSteps} />
            </details>
          ))}

        {status && (
          <div className="mt-2">
            {status.workloads.map((workload, i) => (
              <div key={i}>
                {workload.name}

                <div className="m-2 border-l-2 border-gray-300 ps-4">
                  {workload.nodes.map((node, i) => (
                    <div className="my-1 flex max-w-[500px] gap-2" key={i}>
                      <div className="w-1/2">{node.name}</div>

                      <NodeStatus isReady={node.isReady} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step?.error && (
          <div role="alert" className="alert alert-error text-sm">
            {step.error}
          </div>
        )}
      </div>
    </div>
  );
};
