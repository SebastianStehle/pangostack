import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useClients } from 'src/api';
import { Theme, ThemeContext } from 'src/hooks';
import { texts } from 'src/texts';

const defaultTheme = { name: texts.common.appName };

export function ThemeProvider(props: React.PropsWithChildren) {
  const { children } = props;
  const clientspi = useClients();

  const { data: loadedSettings, refetch } = useQuery({
    queryKey: ['theme'],
    queryFn: () => clientspi.settings.getSettings(),
    refetchOnWindowFocus: false,
  });

  const [customTheme, setCustomTheme] = useState<Theme>({} as any);

  const initialTheme = useMemo(() => {
    return merge(defaultTheme, loadedSettings);
  }, [loadedSettings]);

  const theme = useMemo(() => {
    return merge(initialTheme, customTheme) as Theme;
  }, [customTheme, initialTheme]);

  const setTheme = useCallback((values: Partial<Theme>) => {
    setCustomTheme((v) => ({ ...v, ...values }));
  }, []);

  const context = useMemo(() => {
    return {
      refetch,
      theme,
      setTheme,
    };
  }, [refetch, setTheme, theme]);

  if (!loadedSettings) {
    return null;
  }

  return <ThemeContext.Provider value={context}>{children}</ThemeContext.Provider>;
}

function merge<T extends object>(target: T, source?: Partial<T>): T {
  const result = { ...target };

  if (source) {
    for (const [key, value] of Object.entries(source || {}).filter((x) => !!x[1])) {
      (result as any)[key] = value;
    }
  }

  return result;
}
