import { createContext, useContext, useMemo } from 'react';
import { ProfileDto, useApi } from 'src/api';

export const ProfileContext = createContext<ProfileDto>(null!);

export function useProfile() {
  return useContext(ProfileContext);
}

export function useLogoutUrl() {
  const api = useApi();

  return useMemo(() => {
    const redirectUrl = `${location.protocol}//${location.host}`;

    return `${api.url}/auth/logout?redirectUrl=${redirectUrl}`;
  }, [api.url]);
}

export function useLoginUrl(provider: string) {
  const api = useApi();

  return useMemo(() => {
    const redirectUrl = `${location.protocol}//${location.host}`;

    return `${api.url}/auth/login/${provider}?redirectUrl=${redirectUrl}`;
  }, [api.url, provider]);
}
