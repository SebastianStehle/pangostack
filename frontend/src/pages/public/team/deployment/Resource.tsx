import { ConnectionInfoDto, DeploymentResourceDto, ResourceStatusDto } from 'src/api';

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
    <div>
      {resource.name}

      {Object.entries(actualConnections).map(([key, value]) => (
        <div key={key}>
          {value.label}: {value.value}
        </div>
      ))}

      {status && (
        <>
          {status.workloads.map((workload, i) => (
            <div key={i}>
              {workload.name}

              {workload.nodes.map((node, i) => (
                <div key={i}>{node.name}</div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
