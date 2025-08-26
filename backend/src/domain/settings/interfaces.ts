export type SettingLink = { title: string; url: string };

export interface Settings {
  // The primary color used for buttons and links.
  primaryColor: string;

  // The primary content color used for buttons and links.
  primaryContentColor: string;

  // Some custom css.
  customCss?: string | null;

  // The header color.
  headerColor?: string | null;

  // The heade links.
  headerLinks?: SettingLink[] | null;

  // The footer links.
  footerLinks?: SettingLink[] | null;

  // The footer text, for example for copyright infos.
  footerText?: string | null;

  // Welcome text for the login screen.
  welcomeText?: string | null;

  // The name of the app.
  name: string;
}
