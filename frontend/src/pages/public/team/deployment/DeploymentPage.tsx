import { useParams } from 'react-router-dom';
import { Icon, TransientNavLink } from 'src/components';
import { texts } from 'src/texts';

export const DeploymentPage = () => {
  const { teamId } = useParams();

  return (
    <div className="mb-4 flex items-center gap-4">
      <TransientNavLink className="btn btn-ghost btn-sm text-sm" to={`../${teamId}`}>
        <Icon icon="arrow-left" size={16} />
      </TransientNavLink>

      <h3 className="grow text-xl">{texts.deployments.headline}</h3>
    </div>
  );
};
