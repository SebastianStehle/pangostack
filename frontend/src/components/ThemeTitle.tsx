import { useEffect } from 'react';
import { useTheme } from 'src/hooks';

export function ThemeTitle() {
  const { theme } = useTheme();

  useEffect(() => {
    let actualTitle = theme.name!;

    if (theme.title) {
      actualTitle = `${theme.title} - ${actualTitle}`;
    }

    document.title = actualTitle;
  }, [theme.name, theme.title]);

  return null;
}
