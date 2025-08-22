import { useMemo } from 'react';
import { Navigate, NavigateProps } from 'react-router-dom';
import { useTransientLinkBuilder } from 'src/hooks';

export const TransientNavigate = (props: NavigateProps) => {
  const { to: originalTo, ...other } = props;
  const builder = useTransientLinkBuilder();

  const to = useMemo(() => {
    return builder(originalTo);
  }, [builder, originalTo]);

  return <Navigate to={to} {...other} />;
};
