// The user id used for events that are not triggered by a concrete user, e.g. a scheduled charge.
export const SYSTEM_USER = 'system';

export abstract class TeamEvent {
  constructor(
    public readonly teamId: number,
    public readonly userId: string = SYSTEM_USER,
  ) {}
}

export class DeploymentCreatedEvent extends TeamEvent {
  static readonly TYPE = 'deployment.created';

  constructor(
    teamId: number,
    public readonly deploymentId: number,
    public readonly deploymentName?: string | null,
    userId?: string,
  ) {
    super(teamId, userId);
  }
}

export class DeploymentConfirmedEvent extends TeamEvent {
  static readonly TYPE = 'deployment.confirmed';

  constructor(
    teamId: number,
    public readonly deploymentId: number,
    public readonly deploymentName?: string | null,
    userId?: string,
  ) {
    super(teamId, userId);
  }
}

export class DeploymentDeletedEvent extends TeamEvent {
  static readonly TYPE = 'deployment.deleted';

  constructor(
    teamId: number,
    public readonly deploymentId: number,
    public readonly deploymentName?: string | null,
    userId?: string,
  ) {
    super(teamId, userId);
  }
}

export class SubscriptionCreatedEvent extends TeamEvent {
  static readonly TYPE = 'payment.subscriptionCreated';

  constructor(
    teamId: number,
    public readonly deploymentId: number,
    public readonly deploymentName?: string | null,
    userId?: string,
  ) {
    super(teamId, userId);
  }
}

export class PaymentChargedEvent extends TeamEvent {
  static readonly TYPE = 'payment.charged';

  constructor(
    teamId: number,
    public readonly deploymentId: number,
    public readonly dateFrom: string,
    public readonly dateTo: string,
    userId?: string,
  ) {
    super(teamId, userId);
  }
}

export class MemberAddedEvent extends TeamEvent {
  static readonly TYPE = 'member.added';

  constructor(
    teamId: number,
    public readonly member: string,
    public readonly teamName: string,
    userId?: string,
  ) {
    super(teamId, userId);
  }
}

export class MemberRemovedEvent extends TeamEvent {
  static readonly TYPE = 'member.removed';

  constructor(
    teamId: number,
    public readonly member: string,
    public readonly teamName: string,
    userId?: string,
  ) {
    super(teamId, userId);
  }
}
