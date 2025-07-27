import { Navigate } from 'react-router-dom';
import { useProfile } from 'src/hooks';

export function RouteWhenAdmin(props: React.PropsWithChildren) {
  const { children } = props;

  const profile = useProfile();

  if (!profile.isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
