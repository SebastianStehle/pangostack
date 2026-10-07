import {
  DeploymentConfirmedEvent,
  DeploymentCreatedEvent,
  DeploymentDegradedEvent,
  DeploymentDeletedEvent,
  DeploymentReadyEvent,
  DeploymentRecoveredEvent,
  DeploymentUpdatedEvent,
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
  [DeploymentReadyEvent.TYPE]: DeploymentReadyEvent;
  [DeploymentUpdatedEvent.TYPE]: DeploymentUpdatedEvent;
  [DeploymentDegradedEvent.TYPE]: DeploymentDegradedEvent;
  [DeploymentRecoveredEvent.TYPE]: DeploymentRecoveredEvent;
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
  [DeploymentReadyEvent.TYPE]: (e) => {
    return `Deployment "${e.deploymentName ?? e.deploymentId}" is ready.`;
  },
  [DeploymentUpdatedEvent.TYPE]: (e) => {
    return `Deployment "${e.deploymentName ?? e.deploymentId}" has been updated.`;
  },
  [DeploymentDegradedEvent.TYPE]: (e) => {
    return `Deployment "${e.deploymentName ?? e.deploymentId}" is degraded.`;
  },
  [DeploymentRecoveredEvent.TYPE]: (e) => {
    return `Deployment "${e.deploymentName ?? e.deploymentId}" is healthy again.`;
  },
};
