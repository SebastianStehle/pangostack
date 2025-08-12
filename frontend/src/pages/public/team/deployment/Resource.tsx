import { ConnectionInfoDto, DeploymentResourceDto, ResourceStatusDto } from 'src/api';
import { NodeStatus } from 'src/components';

export interface ResourceProps {
  // The resource that is part of the deployment.
  resource: DeploymentResourceDto;

  // The connection infos.
  connection?: Record<string, ConnectionInfoDto>;

  // The status.
  status?: ResourceStatusDto;
}

export const Resource = (props: ResourceProps) => {
  const { connection, resource, status } = props;
  const actualConnections = connection || [];

  return (
    <div className="card card-border bg-base border-slate-300">
      <div className="card-body">
        <h3 className="card-title">{resource.name}</h3>

        <div className="flex flex-wrap gap-2">
          {Object.entries(actualConnections).map(([key, value]) => (
            <div key={key}>
              {value.label}: {value.value}
            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
};
