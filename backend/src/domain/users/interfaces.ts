export interface User {
  // The user ID from the auth provider.
  id: string;

  // The display name.
  name: string;

  // The email address.
  email: string;

  // The URL to an external picture.
  picture?: string;

  // The user group ID.
  userGroupId: string;

  // Indicates if the user has a password configured.
  hasPassword?: boolean;

  // The user roles.
  roles?: string[];

  // The API Key.
  apiKey?: string;
}

export interface UserGroup {
  // The ID of the user group.
  id: string;

  // The display name.
  name: string;

  // Indicates if the users are admins.
  isAdmin: boolean;

  // Indicates if the user group is builtin and cannot be deleted.
  isBuiltIn: boolean;
}
