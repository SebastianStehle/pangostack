import classNames from 'classnames';
import { memo } from 'react';
import { ServiceDto } from 'src/api';
import { Icon, TransientNavLink } from 'src/components';
import { OverlayDropdown } from 'src/components/Overlay';
import { texts } from 'src/texts';

export interface ServiceProps {
  // The service to render.
  service: ServiceDto;

  // Invoked when updating.
  onUpdate: (service: ServiceDto) => void;
}

export const Service = memo((props: ServiceProps) => {
  const { service, onUpdate } = props;

  return (
    <li className="group flex items-center !px-0">
      <TransientNavLink to={`/admin/services/${service.id}`} className="text-normal block min-w-0 grow truncate text-ellipsis">
        {service.latestVersion && (
          <div className="badge badge-sm badge-primary mr-2 truncate rounded-full font-normal">{service.latestVersion}</div>
        )}

        {service.name}
      </TransientNavLink>

      <OverlayDropdown
        className="p-0"
        button={({ isOpen }) => (
          <button
            className={classNames(
              'btn btn-ghost btn-sm invisible rounded-none bg-slate-100 group-hover:visible hover:bg-slate-100',
              { '!visible': isOpen },
            )}
          >
            <Icon size={16} icon="more-horizontal" />
          </button>
        )}
      >
        <ul tabIndex={0} className="dropdown-menu">
          <li>
            <a onClick={() => onUpdate(service)}>{texts.common.edit}</a>
          </li>
        </ul>
      </OverlayDropdown>
    </li>
  );
});
