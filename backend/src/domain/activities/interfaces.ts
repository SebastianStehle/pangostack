export interface TeamActivity {
  // The ID of the activity.
  id: number;

  // The ID of the team the activity belongs to.
  teamId: number;

  // The key that identifies the type of the activity.
  key: string;

  // The already translated, human readable text of the activity.
  text: string;

  // The date the activity has been logged.
  createdAt: Date;

  // Null for activities that were not triggered by a concrete user, e.g. a scheduled charge.
  createdBy?: string | null;
}
