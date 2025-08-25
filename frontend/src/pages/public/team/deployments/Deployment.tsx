import { DeploymentDto } from 'src/api';
import { DeploymentStatus, HealthStatus, TransientNavLink } from 'src/components';
import { formatDateTime } from 'src/lib';
import { texts } from 'src/texts';

export interface DeploymentProps {
  // The deployment.
  deployment: DeploymentDto;
}

export const Deployment = (props: DeploymentProps) => {
  const { deployment } = props;

  return (
    <TransientNavLink
      to={deployment.id.toString()}
      className="card card-border bg-base hover:border-primary border-slate-200 transition-colors duration-600 ease-in-out"
    >
      <div className="card-body p-6">
        <h2 className="card-title">
          <div className="badge badge-primary badge-sm me-1 rounded-full font-normal">{deployment.serviceVersion}</div>
          {deployment.serviceName}
        </h2>
        <div className="mt-1 grid grid-cols-3 items-center gap-4">
          <HealthStatus status={deployment.healthStatus} />
          <div className="flex items-center gap-1">
            <DeploymentStatus status={deployment.status} /> {texts.common.installation}
          </div>
          <div className="flex items-center justify-end gap-2 text-right">
            {texts.common.createdAt} {formatDateTime(deployment.createdAt)}
          </div>
        </div>
      </div>
    </TransientNavLink>
  );
};
