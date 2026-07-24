import { Navigate } from 'react-router-dom';
import { useProfile } from 'src/hooks';

export interface RouteWhenAdminProps extends React.PropsWithChildren {}

export const RouteWhenAdmin = (props: RouteWhenAdminProps) => {
  const { children } = props;

  const profile = useProfile();

  if (!profile.isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
