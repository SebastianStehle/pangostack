import { useMemo } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { useTransientLinkBuilder } from 'src/hooks';

export const TransientNavLink = (props: NavLinkProps & React.RefAttributes<HTMLAnchorElement>) => {
  const { to: originalTo, ...other } = props;
  const builder = useTransientLinkBuilder();

  const to = useMemo(() => {
    return builder(originalTo);
  }, [builder, originalTo]);

  return <NavLink to={to} {...other} />;
};
