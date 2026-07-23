import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ResourceEvent } from 'src/resources/interface';
import { formatReadiness, ResourceReporterImpl } from './progress';

describe('formatReadiness', () => {
  it('should list the pending names when not everything is ready', () => {
    expect(formatReadiness(1, 3, 'containers', ['db', 'cache'])).toBe('1/3 containers ready (waiting for: db, cache)');
    expect(formatReadiness(3, 3, 'containers', [])).toBe('3/3 containers ready');
  });
});

describe('ResourceReporterImpl', () => {
  function collect(logger?: Logger) {
    const events: ResourceEvent[] = [];
    return { events, reporter: new ResourceReporterImpl((event) => events.push(event), logger) };
  }

  it('should complete the previous sub-step when a new one begins', () => {
    const { events, reporter } = collect();

    reporter.beginStep('First');
    reporter.report('halfway');
    reporter.beginStep('Second');

    expect(events).toEqual([
      { type: 'startStep', id: '1', name: 'First', timestamp: expect.any(Date) },
      { type: 'appendLog', stepId: '1', message: 'halfway', timestamp: expect.any(Date) },
      { type: 'completeStep', id: '1', timestamp: expect.any(Date) },
      { type: 'startStep', id: '2', name: 'Second', timestamp: expect.any(Date) },
    ]);
  });

  it('should fail the current sub-step with a message when the operation fails', () => {
    const { events, reporter } = collect();

    reporter.beginStep('Only');
    reporter.fail('boom');

    expect(events[events.length - 1]).toEqual({ type: 'failStep', id: '1', message: 'boom', timestamp: expect.any(Date) });
  });

  it('should append every reported line to the current sub-step without replacing previous ones', () => {
    const { events, reporter } = collect();

    reporter.beginStep('Only');
    reporter.report('line one');
    reporter.report('line two');

    expect(events.filter((e) => e.type === 'appendLog')).toEqual([
      { type: 'appendLog', stepId: '1', message: 'line one', timestamp: expect.any(Date) },
      { type: 'appendLog', stepId: '1', message: 'line two', timestamp: expect.any(Date) },
    ]);
  });

  it('should still emit a log line with a null step when reported before any step began', () => {
    const { events, reporter } = collect();

    reporter.report('before any step');

    expect(events).toEqual([{ type: 'appendLog', stepId: null, message: 'before any step', timestamp: expect.any(Date) }]);
  });

  it('should additionally write to the logger only when the message is flagged', () => {
    const logger = { log: vi.fn() } as unknown as Logger;
    const { reporter } = collect(logger);

    reporter.beginStep('Only');
    reporter.report('not logged');
    reporter.report('logged', { log: true });

    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith('logged');
  });

  it('should emit context, resource-context and connection events', () => {
    const { events, reporter } = collect();

    reporter.appendContext({ host: '1.2.3.4' });
    reporter.appendResourceContext({ password: 'secret' });
    reporter.appendConnection({ ip: { value: '1.2.3.4', label: 'IP', isPublic: true } });

    expect(events).toEqual([
      { type: 'appendContext', context: { host: '1.2.3.4' }, timestamp: expect.any(Date) },
      { type: 'appendResourceContext', context: { password: 'secret' }, timestamp: expect.any(Date) },
      { type: 'appendConnection', connection: { ip: { value: '1.2.3.4', label: 'IP', isPublic: true } }, timestamp: expect.any(Date) },
    ]);
  });
});
