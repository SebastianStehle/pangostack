import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useClients } from 'src/api';
import { DeploymentStatus, HealthStatus, Icon, Markdown, TransientNavLink } from 'src/components';
import { formatDateTime } from 'src/lib';
import { texts } from 'src/texts';
import { DisplayParameter } from './DisplayParamter';
import { HealthChart } from './HealthChart';
import { PropertyColumn } from './PropertyColumn';
import { Resource } from './Resource';
import { UsageChart } from './UsageChart';

export const DeploymentPage = () => {
  const { deploymentId, teamId } = useParams();
  const clients = useClients();

  const { data: loadedServices } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => clients.services.getServicesPublic(),
    refetchOnWindowFocus: false,
  });

  const { data: loadedStatus } = useQuery({
    queryKey: ['status', teamId, deploymentId],
    queryFn: () => clients.deployments.getDeploymentStatus(+teamId!, +deploymentId!),
    refetchOnWindowFocus: false,
  });

  const { data: loadedDeployments } = useQuery({
    queryKey: ['deployments', teamId],
    queryFn: () => clients.deployments.getDeployments(+teamId!),
    refetchOnWindowFocus: false,
  });

  const deployment = loadedDeployments?.items.find((x) => x.id === +deploymentId!);

  if (!deployment) {
    return null;
  }

  const service = (loadedServices?.items || []).find((x) => x.id === deployment.serviceId);
  const status = loadedStatus?.resources || [];

  if (!service) {
    return null;
  }

  const displayParameters = service.parameters.filter((x) => x.display);

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-4 flex h-10 items-center gap-4">
        <TransientNavLink className="btn btn-ghost btn-sm text-sm" to={`../${teamId}`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <h2 className="grow text-3xl">
          {texts.deployments.deploymentHeadline} {deployment?.serviceName}
        </h2>

        <a className="btn btn-success disabled">{texts.deployments.edit}</a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PropertyColumn label="Service Name" value={deployment.serviceName} />

        <PropertyColumn label="Service Version">
          <div className="badge badge-primary badge-sm me-1 rounded-full font-normal">{deployment.serviceVersion}</div>
        </PropertyColumn>

        <PropertyColumn label="Status">
          <DeploymentStatus status={deployment.status} />
        </PropertyColumn>

        <PropertyColumn label="Health">
          <div className="flex items-center gap-1">
            {deployment.healthStatus ? (
              <>
                <HealthStatus status={deployment.healthStatus} />
                <a className="link" href="#health">
                  {texts.common.more}
                </a>
              </>
            ) : (
              <>-</>
            )}
          </div>
        </PropertyColumn>

        <PropertyColumn label="Created" value={formatDateTime(deployment.createdAt)} />
        <PropertyColumn label="Name" value={deployment.name || '-'} />

        {displayParameters.map((parameter) => (
          <DisplayParameter key={parameter.name} deployment={deployment} parameter={parameter} />
        ))}
      </div>

      {(deployment.status === 'Pending' || deployment.status === 'Running') && (
        <div role="alert" className="alert alert-info alert-outline">
          <span>{texts.deployments.deployingInfo}</span>
        </div>
      )}

      <Markdown>{service.afterInstallationInstructions}</Markdown>

      <div>
        <h2 className="mb-2 text-2xl">Resources</h2>

        {deployment.resources.map((resource) => (
          <Resource
            key={resource.id}
            resource={resource}
            status={status.find((x) => x.resourceId === resource.id)}
            connection={deployment.connections[resource.id]}
          />
        ))}
      </div>

      <div>
        <h2 className="mb-2 text-2xl">Usage</h2>

        <div className="card card-border bg-base sticky top-4 border-slate-300 shadow-sm">
          <div className="card-body">
            <UsageChart teamId={+teamId!} deploymentId={+deploymentId!} />
          </div>
        </div>
      </div>

      <div id="health">
        <h2 className="mb-2 text-2xl">Health</h2>

        <div className="card card-border bg-base sticky top-4 border-slate-300 shadow-sm">
          <div className="card-body">
            <HealthChart teamId={+teamId!} deploymentId={+deploymentId!} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex">
          <div className="grow"></div>
          <div className="w-100">
            <div className="card card-border bg-base sticky top-4 border-slate-300 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-xl">{texts.deployments.estimatedPrice}</h3>
                <div className="mt-4 leading-6">{texts.deployments.estimatedPriceText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {status.length}
    </div>
  );
};
