import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import { To } from 'react-router-dom';
import { Icon } from './Icon';
import { ThemeTitle } from './ThemeTitle';
import { TransientNavLink } from './TransientNavLink';

export interface AdminHeaderProps {
  title: string;

  // The backlink.
  backLink?: To;

  // True, when small.
  small?: boolean;
}

export const AdminHeader = (props: AdminHeaderProps & PropsWithChildren) => {
  const { backLink, children, small, title } = props;

  return (
    <div className="mb-4 mb-8 flex h-12 items-center gap-4">
      <ThemeTitle text={title} />

      {backLink && (
        <TransientNavLink className="btn btn-ghost btn-circle text-sm" to={backLink}>
          <Icon icon="arrow-left" size={16} />
        </TransientNavLink>
      )}

      <h3 className={classNames('grow text-3xl', { 'text-xl': small })}>{title}</h3>

      <div className="flex items-center gap-4">{children}</div>
    </div>
  );
};
