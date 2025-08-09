export interface User {
  // The user ID from the auth provider.
  id: string;

  // The display name.
  name: string;

  // The email address.
  email: string;

  // The URL to an external picture.
  picture?: string | null;

  // The user group ID.
  userGroupId: string;

  // Indicates if the user has a password configured.
  hasPassword: boolean;

  // The user roles.
  roles?: string[] | null;

  // The API Key.
  apiKey?: string | null;
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

export interface Team {
  // The ID of the team.
  id: number;

  // The display name.
  name: string;

  // The associated users.
  users: TeamUser[];
}

export interface TeamUser {
  // The user.
  user: User;

  // The role of the user within the team.
  role: string;
}
