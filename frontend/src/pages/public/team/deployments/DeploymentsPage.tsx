import { Icon, TransientNavLink } from 'src/components';
import { texts } from 'src/texts';

export const DeploymentsPage = () => {
  return (
    <div>
      <TransientNavLink to="../deploy" className="btn btn-success">
        <Icon icon="plus" /> {texts.deployments.create}
      </TransientNavLink>
    </div>
  );
};
