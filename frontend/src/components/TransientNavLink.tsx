import { useMemo } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { useTransientLinkBuilder } from 'src/hooks';

export interface TransientNavLinkProps extends NavLinkProps, React.RefAttributes<HTMLAnchorElement> {}

export const TransientNavLink = (props: TransientNavLinkProps) => {
  const { to: originalTo, ...other } = props;
  const builder = useTransientLinkBuilder();

  const to = useMemo(() => {
    return builder(originalTo);
  }, [builder, originalTo]);

  return <NavLink to={to} {...other} />;
};
