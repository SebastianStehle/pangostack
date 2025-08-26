import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { DeploymentDto, useClients } from 'src/api';
import { Empty, RefreshButton, Spinner } from 'src/components';
import LogViewer from 'src/components/LogViewer';
import { texts } from 'src/texts';

export interface DeploymentLogProps {
  // The deployment that contains the parameters.
  deployment: DeploymentDto;
}

export const DeploymentLog = (props: DeploymentLogProps) => {
  const { deployment } = props;
  const clients = useClients();

  const {
    data: loadedLogs,
    isFetched,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['deployment-logs', deployment.id],
    queryFn: () => {
      return clients.deployments.getDeploymentLogs(deployment.id);
    },
  });

  const instances = useMemo(() => {
    const logs: { id: string; messages: string }[] = [];
    for (const resource of loadedLogs?.resources || []) {
      for (const instance of resource.instances) {
        logs.push({ id: instance.instanceId, messages: instance.messages });
      }
    }

    return logs;
  }, [loadedLogs]);

  const [selectedInstanceId, setSelectedInstanceID] = useState<string | null>(null);
  const selectedInstance = instances.find((x) => x.id === selectedInstanceId);

  useMemo(() => {
    setSelectedInstanceID((instance) => {
      if (!instances.find((x) => x.id === instance)) {
        return instances[0]?.id || null;
      } else {
        return instance;
      }
    });
  }, [instances]);

  return (
    <>
      {isLoading && !isFetched && <Spinner visible={true} />}

      {instances.length > 0 && (
        <div className="bg-base-200 rounded-lg p-2">
          <div className="mb-4 flex gap-4">
            <div className="grow overflow-x-auto">
              <div role="tablist" className="tabs tabs-box flex-nowrap shadow-none">
                {instances.map((instance) => (
                  <a
                    role="tab"
                    className={classNames('tab shrink-0', { 'tab-active': instance.id === selectedInstanceId })}
                    onClick={() => setSelectedInstanceID(instance.id)}
                  >
                    {instance.id}
                  </a>
                ))}
              </div>
            </div>
            <div className="pe-2 pt-2">
              <RefreshButton sm isLoading={isRefetching} onClick={refetch} />
            </div>
          </div>

          {isFetched && instances.length === 0 && (
            <Empty icon="no-document" label={texts.deployments.emptyLog} text={texts.deployments.emptyLogText} />
          )}

          {selectedInstance && <LogViewer messages={selectedInstance.messages} />}
        </div>
      )}
    </>
  );
};
