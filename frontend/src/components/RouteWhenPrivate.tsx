import { useQuery } from '@tanstack/react-query';
import { ProfileContext } from 'src/hooks';
import { useClients } from '../api';

export const RouteWhenPrivate = (props: React.PropsWithChildren) => {
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
