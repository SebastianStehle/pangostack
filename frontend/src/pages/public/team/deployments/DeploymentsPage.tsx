import { useQuery } from '@tanstack/react-query';
import { useClients } from 'src/api';
import { Empty, Icon, Spinner, TransientNavLink } from 'src/components';
import { useTypedParams } from 'src/hooks';
import { texts } from 'src/texts';
import { Deployment } from './Deployment';

export const DeploymentsPage = () => {
  const { teamId } = useTypedParams({ teamId: 'int' });
  const clients = useClients();

  const {
    data: loadedDeployments,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ['deployments', teamId],
    queryFn: () => clients.deployments.getTeamDeployments(teamId),
  });

  const deployments = loadedDeployments?.items || [];

  return (
    <>
      <div className="mb-8 flex h-10 items-center gap-4">
        <h2 className="grow text-2xl">{texts.deployments.headline}</h2>

        <TransientNavLink className="btn btn-success" to="new">
          <Icon icon="plus" /> {texts.deployments.create}
        </TransientNavLink>
      </div>

      <div className="flex flex-col gap-2">
        {deployments.map((deployment) => (
          <Deployment key={deployment.id} deployment={deployment} />
        ))}
      </div>

      {isLoading && !isFetched && <Spinner visible={true} />}

      {isFetched && deployments.length === 0 && (
        <Empty icon="no-connection" label={texts.deployments.emptyLabel} text={texts.deployments.emptyText} />
      )}
    </>
  );
};
