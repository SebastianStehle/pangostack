import { Response } from 'express';
import { describe, expect, it } from 'vitest';
import { Resource, ResourceEvent } from 'src/resources/interface';
import { ResourceRequestDto } from '../shared';
import { DeploymentController } from './deployment.controller';

function createResponse() {
  const lines: string[] = [];

  const res = {
    ended: false,
    setHeader: () => res,
    flushHeaders: () => {},
    write: (chunk: string) => {
      lines.push(chunk);
      return true;
    },
    end: () => {
      res.ended = true;
    },
  };

  return { res: res as unknown as Response, lines, state: res };
}

function createResource(apply: Resource['apply']): Resource {
  return {
    descriptor: { name: 'test', description: 'A test resource.', parameters: {}, context: {} },
    apply,
    delete: () => Promise.resolve(),
    status: () => Promise.resolve({ workloads: [] }),
  };
}

function createController(resource: Resource) {
  return new DeploymentController(new Map([['test', resource]]));
}

const request = {
  resourceUniqueId: 'unique-id',
  resourceType: 'test',
  parameters: {},
  resourceContext: {},
  timeoutMs: 1000,
} as ResourceRequestDto;

function parseEvents(lines: string[]) {
  return lines.map((line) => JSON.parse(line) as ResourceEvent);
}

describe('DeploymentController', () => {
  it('should stream step lifecycle and reported values and end with a complete event when the resource succeeds', async () => {
    const controller = createController(
      createResource(async (_id, _request, reporter) => {
        reporter.beginStep('First');
        reporter.report('working');
        reporter.appendContext({ key: 'value' });
      }),
    );

    const { res, lines, state } = createResponse();
    await controller.applyResourceStreamed(request, res);

    const events = parseEvents(lines);

    expect(events).toEqual([
      { type: 'startStep', id: '1', name: 'First', timestamp: expect.any(String) },
      { type: 'appendLog', stepId: '1', message: 'working', timestamp: expect.any(String) },
      { type: 'appendContext', context: { key: 'value' }, timestamp: expect.any(String) },
      { type: 'completeStep', id: '1', timestamp: expect.any(String) },
      { type: 'complete', timestamp: expect.any(String) },
    ]);
    expect(state.ended).toBe(true);
  });

  it('should fail the current sub-step and end with a fail event when the resource fails', async () => {
    const controller = createController(
      createResource(async (_id, _request, reporter) => {
        reporter.beginStep('First');

        throw new Error('boom');
      }),
    );

    const { res, lines, state } = createResponse();
    await controller.applyResourceStreamed(request, res);

    const events = parseEvents(lines);
    const lastEvent = events[events.length - 1];

    expect(lastEvent).toEqual({ type: 'fail', error: 'boom', timestamp: expect.any(String) });
    expect(events).toContainEqual({ type: 'failStep', id: '1', message: 'boom', timestamp: expect.any(String) });
    expect(state.ended).toBe(true);
  });

  it('should reject unknown resource types before streaming starts', async () => {
    const controller = createController(createResource(() => Promise.resolve()));

    const { res, lines } = createResponse();
    const promise = controller.applyResourceStreamed({ ...request, resourceType: 'unknown' } as ResourceRequestDto, res);

    await expect(promise).rejects.toThrow('Unknown resource type unknown');
    expect(lines).toEqual([]);
  });
});
