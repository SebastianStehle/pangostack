import { useQuery } from '@tanstack/react-query';
import { ProfileContext } from 'src/hooks';
import { useApi } from '../api';

export function RouteWhenPrivate(props: React.PropsWithChildren) {
  const { children } = props;

  const api = useApi();
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.auth.getProfile(),
    refetchOnWindowFocus: false,
  });

  if (!profile) {
    return null;
  }

  return <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>;
}
