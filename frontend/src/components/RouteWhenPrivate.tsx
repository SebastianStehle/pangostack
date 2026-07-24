import { useQuery } from '@tanstack/react-query';
import { ProfileContext } from 'src/hooks';
import { useClients } from '../api';

export interface RouteWhenPrivateProps extends React.PropsWithChildren {}

export const RouteWhenPrivate = (props: RouteWhenPrivateProps) => {
  const { children } = props;
  const clients = useClients();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => clients.auth.getProfile(),
  });

  if (!profile) {
    return null;
  }

  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
};
