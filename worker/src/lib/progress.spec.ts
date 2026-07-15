import { describe, expect, it } from 'vitest';
import { formatReadiness, ProgressTracker } from './progress';

describe('formatReadiness', () => {
  it('should list the pending names when not everything is ready', () => {
    expect(formatReadiness(1, 3, 'containers', ['db', 'cache'])).toBe('1/3 containers ready (waiting for: db, cache)');
    expect(formatReadiness(3, 3, 'containers', [])).toBe('3/3 containers ready');
  });
});

describe('ProgressTracker', () => {
  it('should complete the previous sub-step when a new one begins', () => {
    const tracker = new ProgressTracker(() => {});

    tracker.beginStep('First');
    tracker.update('halfway');
    tracker.beginStep('Second');

    expect(tracker.subSteps[0]).toMatchObject({ name: 'First', status: 'Completed', message: 'halfway' });
    expect(tracker.subSteps[1]).toMatchObject({ name: 'Second', status: 'Running' });
    expect(tracker.subSteps[0].completedAt).toBeDefined();
  });

  it('should fail the current sub-step with a message when the operation fails', () => {
    let notifications = 0;
    const tracker = new ProgressTracker(() => notifications++);

    tracker.beginStep('Only');
    tracker.fail('boom');

    expect(tracker.subSteps[0]).toMatchObject({ name: 'Only', status: 'Failed', message: 'boom' });
    expect(notifications).toBe(2);
  });
});
