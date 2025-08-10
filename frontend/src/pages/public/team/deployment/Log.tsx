import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { DeploymentDto, useClients } from 'src/api';
import { Empty, Spinner } from 'src/components';
import LogViewer from 'src/components/LogViewer';
import { texts } from 'src/texts';

export interface LogProps {
  // The deployment that contains the parameters.
  deployment: DeploymentDto;

  // The ID of the team.
  teamId: number;
}

export const Log = (props: LogProps) => {
  const { deployment, teamId } = props;
  const clients = useClients();

  const {
    data: loadedLogs,
    isFetched,
    isLoading,
  } = useQuery({
    queryKey: ['deployment-logs', teamId, deployment.id],
    queryFn: () => {
      return clients.deployments.getDeploymentLogs(teamId, deployment.id);
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
      {isLoading && <Spinner visible={true} />}

      {isFetched && instances.length === 1 && (
        <Empty icon="no-document" label={texts.billing.emptyLabel} text={texts.billing.emptyText} />
      )}

      {instances.length > 0 && (
        <div className="bg-base-200 rounded-lg p-2">
          <div role="tablist" className="tabs tabs-box shadow-none">
            {instances.map((instance) => (
              <a
                role="tab"
                className={classNames('tab', { 'tab-active': instance.id === selectedInstanceId })}
                onClick={() => setSelectedInstanceID(instance.id)}
              >
                {instance.id}
              </a>
            ))}
          </div>

          {selectedInstance && <LogViewer messages={selectedInstance.messages} />}
        </div>
      )}
    </>
  );
};
