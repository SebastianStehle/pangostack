import { DeploymentDto } from 'src/api';
import { DeploymentStatus, HealthStatus, Icon, TransientNavLink } from 'src/components';
import { formatDateTime, last } from 'src/lib';
import { texts } from 'src/texts';

export interface DeploymentProps {
  // The deployment.
  deployment: DeploymentDto;
}

export const Deployment = (props: DeploymentProps) => {
  const { deployment } = props;
  const update = last(deployment.availableUpdates);

  return (
    <TransientNavLink
      to={deployment.id.toString()}
      className="card card-border bg-base hover:border-primary cursor-pointer border-gray-300 transition-colors duration-500 ease-in-out"
    >
      <div className="card-body p-6">
        <div className="flex">
          <h2 className="card-title grow">
            <div className="badge badge-primary badge-sm me-1 rounded-full font-normal">{deployment.serviceVersion}</div>
            {deployment.serviceName}
          </h2>

          {update && (
            <div className="alert-sm text-md text-error flex items-center gap-1 font-medium uppercase">
              <Icon icon="alert" size={16} />
              {texts.deployments.updateAvailable}
            </div>
          )}
        </div>
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
