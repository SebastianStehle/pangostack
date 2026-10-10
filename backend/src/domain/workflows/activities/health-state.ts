import { DeploymentCheckStatus, DeploymentHealthStatus } from 'src/domain/database';

// A single failed check could be a network blip, so the status only changes when consecutive checks agree.
export const HEALTH_CONFIRMATION_CHECKS = 2;

// Even a confirmed status change is only announced once per cooldown, so that a slowly flapping service does not spam.
export const HEALTH_NOTIFICATION_COOLDOWN_MS = 2 * 60 * 60 * 1000;

export interface HealthState {
  healthStatus: DeploymentHealthStatus | null;
  notifiedHealthStatus: DeploymentHealthStatus | null;
  healthNotifiedAt: Date | null;
}

export interface HealthTransition {
  state: HealthState;
  notify: DeploymentHealthStatus | null;
}

export function computeHealthTransition(
  current: Partial<HealthState>,
  recentChecks: DeploymentCheckStatus[],
  now: Date,
): HealthTransition {
  const state: HealthState = {
    healthStatus: current.healthStatus ?? null,
    notifiedHealthStatus: current.notifiedHealthStatus ?? null,
    healthNotifiedAt: current.healthNotifiedAt ?? null,
  };

  const confirming = recentChecks.slice(0, HEALTH_CONFIRMATION_CHECKS);
  if (confirming.length === HEALTH_CONFIRMATION_CHECKS && confirming.every((x) => x === confirming[0])) {
    state.healthStatus = confirming[0] === 'Succeeded' ? 'Healthy' : 'Degraded';
  }

  if (!state.healthStatus || state.healthStatus === state.notifiedHealthStatus) {
    return { state, notify: null };
  }

  // The first confirmed status is only the baseline, because new deployments are usually unhealthy until the DNS is set up.
  if (!state.notifiedHealthStatus) {
    state.notifiedHealthStatus = state.healthStatus;
    return { state, notify: null };
  }

  // A status that is still different after the cooldown is announced then, so no change gets lost.
  if (state.healthNotifiedAt && now.getTime() - state.healthNotifiedAt.getTime() < HEALTH_NOTIFICATION_COOLDOWN_MS) {
    return { state, notify: null };
  }

  state.notifiedHealthStatus = state.healthStatus;
  state.healthNotifiedAt = now;
  return { state, notify: state.healthStatus };
}
