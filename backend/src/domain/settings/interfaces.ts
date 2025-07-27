import { ChatSuggestion } from '../shared';

export interface Settings {
  // The primary color used for buttons and links.
  primaryColor: string;

  // The primary content color used for buttons and links.
  primaryContentColor: string;

  // The name of the agent.
  agentName?: string;

  // The footer text to be shown below the chat.
  chatFooter?: string;

  // The suggestions to be shown for the chat.
  chatSuggestions?: ChatSuggestion[];

  // The file server.
  fileServer?: string;

  // Some custom css.
  customCss?: string;

  // Welcome text for the login screen.
  welcomeText?: string;

  // The name of the app.
  name: string;
}
