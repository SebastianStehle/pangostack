import { createContext, useContext } from 'react';
import { SettingsDto } from 'src/api';

export interface Theme extends SettingsDto {
  // The optional logo to override the default one.
  logo?: File;

  // The background on the login page.
  loginBackground?: File;

  // The logo on the login page.
  loginLogo?: File;

  // The pae title.
  title?: string | null;
}

interface ThemeState {
  // The actual theme.
  theme: Theme;

  // Reloads the theme.
  refetch: () => void;

  // Make as a partial update of the theme.
  setTheme: (theme: Partial<Theme>) => void;
}

export const ThemeContext = createContext<ThemeState>(null!);

export function useTheme() {
  return useContext(ThemeContext);
}
