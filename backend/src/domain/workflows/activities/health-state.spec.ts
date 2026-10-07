import { describe, expect, it } from 'vitest';
import { computeHealthTransition, HEALTH_NOTIFICATION_COOLDOWN_MS } from './health-state';

describe('computeHealthTransition', () => {
  const now = new Date('2026-10-07T12:00:00Z');
  const longAgo = new Date(now.getTime() - HEALTH_NOTIFICATION_COOLDOWN_MS - 1);
  const recently = new Date(now.getTime() - 1);

  it('should use the first confirmed status as baseline without notifying', () => {
    const result = computeHealthTransition({}, ['Failed', 'Failed'], now);

    expect(result.state).toEqual({ healthStatus: 'Degraded', notifiedHealthStatus: 'Degraded', healthNotifiedAt: null });
    expect(result.notify).toBeNull();
  });

  it('should not change the status when a single check fails', () => {
    const result = computeHealthTransition(
      { healthStatus: 'Healthy', notifiedHealthStatus: 'Healthy' },
      ['Failed', 'Succeeded'],
      now,
    );

    expect(result.state.healthStatus).toBe('Healthy');
    expect(result.notify).toBeNull();
  });

  it('should notify when consecutive checks confirm a change', () => {
    const result = computeHealthTransition(
      { healthStatus: 'Healthy', notifiedHealthStatus: 'Healthy', healthNotifiedAt: longAgo },
      ['Failed', 'Failed'],
      now,
    );

    expect(result.state).toEqual({ healthStatus: 'Degraded', notifiedHealthStatus: 'Degraded', healthNotifiedAt: now });
    expect(result.notify).toBe('Degraded');
  });

  it('should postpone the notification during the cooldown and send it afterwards', () => {
    const current = { healthStatus: 'Healthy', notifiedHealthStatus: 'Healthy', healthNotifiedAt: recently } as const;

    const during = computeHealthTransition(current, ['Failed', 'Failed'], now);
    expect(during.state.healthStatus).toBe('Degraded');
    expect(during.notify).toBeNull();

    const after = computeHealthTransition(
      during.state,
      ['Failed', 'Failed'],
      new Date(now.getTime() + HEALTH_NOTIFICATION_COOLDOWN_MS),
    );
    expect(after.notify).toBe('Degraded');
  });

  it('should not notify when the status flips back during the cooldown', () => {
    const result = computeHealthTransition(
      { healthStatus: 'Degraded', notifiedHealthStatus: 'Healthy', healthNotifiedAt: recently },
      ['Succeeded', 'Succeeded'],
      now,
    );

    expect(result.state.healthStatus).toBe('Healthy');
    expect(result.notify).toBeNull();
  });
});
