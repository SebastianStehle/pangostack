import {
  DeploymentConfirmedEvent,
  DeploymentCreatedEvent,
  DeploymentDeletedEvent,
  MemberAddedEvent,
  MemberRemovedEvent,
  PaymentChargedEvent,
  SubscriptionCreatedEvent,
} from 'src/domain/events';

interface ActivityEvents {
  [DeploymentCreatedEvent.TYPE]: DeploymentCreatedEvent;
  [DeploymentConfirmedEvent.TYPE]: DeploymentConfirmedEvent;
  [DeploymentDeletedEvent.TYPE]: DeploymentDeletedEvent;
  [SubscriptionCreatedEvent.TYPE]: SubscriptionCreatedEvent;
  [PaymentChargedEvent.TYPE]: PaymentChargedEvent;
  [MemberAddedEvent.TYPE]: MemberAddedEvent;
  [MemberRemovedEvent.TYPE]: MemberRemovedEvent;
}

export type ActivityKey = keyof ActivityEvents;

// The single place for all activity texts. Each renderer receives its concrete, strongly typed event
// as it was stored, so the wording lives in exactly one place and stays type safe.
export const ACTIVITY_TEXTS: { [K in ActivityKey]: (event: ActivityEvents[K]) => string } = {
  [DeploymentCreatedEvent.TYPE]: (e) => {
    return `Deployment "${e.deploymentName ?? e.deploymentId}" has been created.`;
  },
  [DeploymentConfirmedEvent.TYPE]: (e) => {
    return `Deployment "${e.deploymentName ?? e.deploymentId}" has been confirmed and is starting.`;
  },
  [DeploymentDeletedEvent.TYPE]: (e) => {
    return `Deployment "${e.deploymentName ?? e.deploymentId}" has been deleted.`;
  },
  [SubscriptionCreatedEvent.TYPE]: (e) => {
    return `A subscription has been created for deployment "${e.deploymentName ?? e.deploymentId}".`;
  },
  [PaymentChargedEvent.TYPE]: (e) => {
    return `An invoice has been charged for the billing period ${e.dateFrom} - ${e.dateTo}.`;
  },
  [MemberAddedEvent.TYPE]: (e) => {
    return `${e.member} has been added to the team.`;
  },
  [MemberRemovedEvent.TYPE]: (e) => {
    return `${e.member} has been removed from the team.`;
  },
};
