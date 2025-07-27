import classNames from 'classnames';
import classnames from 'classnames';
import { memo } from 'react';
import { DeploymentDto } from 'src/api';
import { ConfirmDialog, Icon, TransientNavLink } from 'src/components';
import { OverlayDropdown } from 'src/components/Overlay';
import { texts } from 'src/texts';

export interface DeploymentProps {
  // The deployment to render.
  deployment: DeploymentDto;

  // Invoked when deleted.
  onDelete: (deployment: DeploymentDto) => void;

  // Invoked when updating.
  onUpdate: (bucket: DeploymentDto) => void;
}

export const Deployment = memo((props: DeploymentProps) => {
  const { deployment, onDelete, onUpdate } = props;

  return (
    <li className="group flex items-center !px-0">
      <TransientNavLink
        className={classnames('text-normal block min-w-0 grow truncate text-ellipsis', { 'opacity-25': !deployment.enabled })}
        to={`/admin/extensions/${deployment.id}`}
      >
        {deployment.name}
      </TransientNavLink>

      <OverlayDropdown
        className="p-0"
        button={({ isOpen }) => (
          <button
            className={classNames(
              'btn btn-ghost btn-sm invisible rounded-none bg-slate-100 hover:bg-slate-100 group-hover:visible',
              { 'btn-secondary !visible': isOpen },
            )}
          >
            <Icon size={16} icon="more-horizontal" />
          </button>
        )}
      >
        <ul tabIndex={0} className="dropdown-menu">
          <li>
            <a onClick={() => onUpdate(deployment)}>{texts.common.edit}</a>
          </li>
          <li>
            <ConfirmDialog
              title={texts.extensions.removeDeploymentConfirmTitle}
              text={texts.extensions.removeDeploymentConfirmText}
              onPerform={() => onDelete(deployment)}
            >
              {({ onClick }) => <a onClick={onClick}>{texts.common.remove}</a>}
            </ConfirmDialog>
          </li>
        </ul>
      </OverlayDropdown>
    </li>
  );
});
