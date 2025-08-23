import { createContext, useContext, useMemo } from 'react';
import { ProfileDto, useClients } from 'src/api';

export const ProfileContext = createContext<ProfileDto>(null!);

export function useProfile() {
  return useContext(ProfileContext);
}

export function useLogoutUrl() {
  const clients = useClients();
  return useMemo(() => {
    const redirectUrl = `${location.protocol}//${location.host}`;

    return `${clients.url}/api/auth/logout?redirectUrl=${redirectUrl}`;
  }, [clients.url]);
}

export function useLoginUrl(provider: string) {
  const clients = useClients();
  return useMemo(() => {
    const redirectUrl = `${location.protocol}//${location.host}`;

    return `${clients.url}/api/auth/login/${provider}?redirectUrl=${redirectUrl}`;
  }, [clients.url, provider]);
}
