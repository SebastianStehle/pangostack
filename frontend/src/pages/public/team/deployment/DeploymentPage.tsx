import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClients } from 'src/api';
import { DeploymentStatus, HealthStatus, Icon, TransientNavLink } from 'src/components';
import { formatDateTime } from 'src/lib';
import { texts } from 'src/texts';
import { DisplayParameter } from './DisplayParamter';
import { HealthChart } from './HealthChart';
import { Instructions } from './Instructions';
import { Log } from './Log';
import { PropertyColumn } from './PropertyColumn';
import { Resource } from './Resource';
import { UsageChart } from './UsageChart';

export const DeploymentPage = () => {
  const { deploymentId, teamId } = useParams();
  const clients = useClients();
  const [tab, setTab] = useState<'overview' | 'usage' | 'log'>('overview');

  const { data: loadedServices } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => clients.services.getServicesPublic(),
  });

  const { data: loadedStatus } = useQuery({
    queryKey: ['deployment-status', teamId, deploymentId],
    queryFn: () => clients.deployments.getDeploymentStatus(+teamId!, +deploymentId!),
  });

  const { data: loadedDeployments } = useQuery({
    queryKey: ['deployments', teamId],
    queryFn: () => clients.deployments.getDeployments(+teamId!),
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
        <TransientNavLink className="btn btn-ghost btn-circle text-sm" to={`../${teamId}`}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>

        <div className="grow">
          <h2 className="text-3xl">
            {texts.deployments.deploymentHeadline} {deployment.name || deployment?.serviceName}
          </h2>

          <div className="mt-2 text-slate-500">
            {deployment.serviceName}, {deployment.serviceVersion}
          </div>
        </div>

        <a className="btn btn-success disabled">{texts.deployments.edit}</a>
      </div>

      <div className="-mx-8 border-b border-gray-200 px-4">
        <div role="tablist" className="tabs tabs-border">
          <a role="tab" className={classNames('tab', { 'tab-active': tab === 'overview' })} onClick={() => setTab('overview')}>
            Overview
          </a>
          <a role="tab" className={classNames('tab', { 'tab-active': tab === 'usage' })} onClick={() => setTab('usage')}>
            Usage Graphs
          </a>
          <a role="tab" className={classNames('tab', { 'tab-active': tab === 'log' })} onClick={() => setTab('log')}>
            Log
          </a>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-3 gap-6">
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
            <div role="alert" className="alert alert-info">
              <span>{texts.deployments.deployingInfo}</span>
            </div>
          )}

          {service.afterInstallationInstructions && (
            <div>
              <h2 className="mb-3 flex items-center gap-3 text-xl">
                <Icon icon="server" size={16} className="inline-block" /> Instructions
              </h2>
              <div className="card card-border bg-base border-slate-300">
                <div className="card-body">
                  <Instructions deployment={deployment} text={service.afterInstallationInstructions} />
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 flex items-center gap-3 text-xl">
              <Icon icon="server" size={16} className="inline-block" /> Resources
            </h2>

            <div className="flex flex-col gap-2">
              {deployment.resources.map((resource) => (
                <Resource
                  key={resource.id}
                  resource={resource}
                  status={status.find((x) => x.resourceId === resource.id)}
                  connection={deployment.connections[resource.id]}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'usage' && (
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-3 flex items-center gap-3 text-xl">
              <Icon icon="server" size={16} className="inline-block" /> Usage
            </h2>

            <UsageChart teamId={+teamId!} deploymentId={+deploymentId!} />

            <div className="mt-4 text-right text-xs">{texts.deployments.usageChartWarning}</div>
          </div>

          <div id="health">
            <h2 className="mb-3 flex items-center gap-3 text-xl">
              <Icon icon="server" size={16} className="inline-block" /> Health
            </h2>

            <HealthChart teamId={+teamId!} deploymentId={+deploymentId!} />

            <div className="mt-4 text-right text-xs">{texts.deployments.checkChartWarning}</div>
          </div>
        </div>
      )}

      {tab === 'log' && <Log deployment={deployment} teamId={+teamId!} />}
    </div>
  );
};
