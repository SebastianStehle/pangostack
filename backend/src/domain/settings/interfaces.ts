export type SettingLink = { title: string; url: string };

export interface Settings {
  // The primary color used for buttons and links.
  primaryColor: string;

  // The primary content color used for buttons and links.
  primaryContentColor: string;

  // Some custom css.
  customCss?: string;

  // The header color.
  headerColor?: string;

  // The footer link.
  footerLinks?: SettingLink[];

  // The footer text, for example for copyright infos.
  footerText?: string;

  // Welcome text for the login screen.
  welcomeText?: string;

  // The name of the app.
  name: string;
}
