import { useMutation, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from 'src/api';
import { toast } from 'react-toastify';
import {
  AdminHeader,
  ConfirmDialog,
  DeploymentDisplayParameter,
  DeploymentHealthChart,
  DeploymentInstructions,
  DeploymentLog,
  DeploymentResource,
  DeploymentStatus,
  DeploymentUsageChart,
  HealthStatus,
  Icon,
  Page,
  PropertyColumn,
  RefreshButton,
  Spinner,
} from 'src/components';
import { useTypedParams } from 'src/hooks';
import { formatDateTime } from 'src/lib';
import { texts } from 'src/texts';

export const DeploymentPage = () => {
  const { deploymentId, teamId } = useTypedParams({ deploymentId: 'int', teamId: 'int' });
  const clients = useClients();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview' | 'usage' | 'log'>('overview');

  const { data: loadedServices } = useQuery({
    queryKey: ['services-public'],
    queryFn: () => clients.services.getServicesPublic(),
  });

  const {
    data: loadedStatus,
    refetch,
    isFetching: isFetchingServices,
  } = useQuery({
    queryKey: ['deployment-status', teamId, deploymentId],
    queryFn: () => clients.deployments.getDeploymentStatus(deploymentId),
  });

  const { data: deployment } = useQuery({
    queryKey: ['deployment', deploymentId],
    queryFn: () => clients.deployments.getDeployment(deploymentId),
  });

  const deleting = useMutation({
    mutationFn: () => {
      return clients.deployments.deleteDeployment(deploymentId);
    },
    onSuccess: () => {
      toast.info(texts.deployments.deleteConfirmed);
      navigate('../');
    },
  });

  if (!deployment) {
    return <Spinner visible={true} />;
  }

  const service = (loadedServices?.items || []).find((x) => x.id === deployment.serviceId);
  const status = loadedStatus?.resources || [];

  if (!service) {
    return <Spinner visible={true} />;
  }

  const displayParameters = service.parameters.filter((x) => x.display);

  return (
    <Page>
      <AdminHeader
        backLink="/admin/deployments"
        title={`${texts.deployments.deploymentHeadline} ${deployment.name || deployment?.serviceName}`}
      >
        <RefreshButton sm isLoading={isFetchingServices} onClick={refetch} />

        <ConfirmDialog
          title={texts.deployments.deleteConfirmTitle}
          text={texts.deployments.deleteConfirmText}
          onPerform={deleting.mutate}
        >
          {({ onClick }) => (
            <button type="button" className="btn btn-square btn-error" onClick={onClick}>
              <Icon size={18} icon="trash" />
            </button>
          )}
        </ConfirmDialog>
      </AdminHeader>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="-mx-6 mb-8 border-b border-gray-200 px-4">
            <div role="tablist" className="tabs tabs-lg text-mdx tabs-border">
              <a
                role="tab"
                className={classNames('tab text-mdx', { 'tab-active': tab === 'overview' })}
                onClick={() => setTab('overview')}
              >
                {texts.common.overview}
              </a>
              <a
                role="tab"
                className={classNames('tab text-mdx', { 'tab-active': tab === 'usage' })}
                onClick={() => setTab('usage')}
              >
                {texts.common.usage}
              </a>
              <a //
                role="tab"
                className={classNames('tab text-mdx', { 'tab-active': tab === 'log' })}
                onClick={() => setTab('log')}
              >
                {texts.common.logViewer}
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
                        <a className="link" onClick={() => setTab('usage')}>
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
                  <DeploymentDisplayParameter key={parameter.name} deployment={deployment} parameter={parameter} />
                ))}
              </div>

              {(deployment.status === 'Pending' || deployment.status === 'Running') && (
                <div role="alert" className="alert alert-info">
                  <Icon icon="info" />
                  <span>{texts.deployments.deployingInfo}</span>
                </div>
              )}

              {service.afterInstallationInstructions && (
                <div>
                  <h2 className="mb-3 flex items-center gap-3 text-xl">
                    <Icon icon="info" size={16} className="inline-block" /> {texts.common.instructions}
                  </h2>
                  <div className="card card-border bg-base border-slate-300">
                    <div className="card-body">
                      <DeploymentInstructions deployment={deployment} text={service.afterInstallationInstructions} />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h2 className="mb-3 flex items-center gap-3 text-xl">
                  <Icon icon="server" size={16} className="inline-block" /> {texts.deployments.resources}
                </h2>

                <div className="flex flex-col gap-2">
                  {deployment.resources.map((resource) => (
                    <DeploymentResource
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
                  <Icon icon="bar-chart" size={16} className="inline-block" /> {texts.common.usage}
                </h2>

                <DeploymentUsageChart deploymentId={deploymentId} />

                <div className="mt-4 text-right text-xs">{texts.deployments.usageChartWarning}</div>
              </div>

              <div id="health">
                <h2 className="mb-3 flex items-center gap-3 text-xl">
                  <Icon icon="activity" size={16} className="inline-block" /> {texts.common.health}
                </h2>

                <DeploymentHealthChart deploymentId={deploymentId} />

                <div className="mt-4 text-right text-xs">{texts.deployments.checkChartWarning}</div>
              </div>
            </div>
          )}

          {tab === 'log' && <DeploymentLog deployment={deployment} />}
        </div>
      </div>
    </Page>
  );
};
