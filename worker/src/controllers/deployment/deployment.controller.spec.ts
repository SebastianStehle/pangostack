import { Response } from 'express';
import { describe, expect, it } from 'vitest';
import { Resource } from 'src/resources/interface';
import { ResourceRequestDto } from '../shared';
import { DeploymentController, ResourceApplyStreamEvent } from './deployment.controller';

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
  return lines.map((line) => JSON.parse(line) as ResourceApplyStreamEvent);
}

function parseSnapshots(lines: string[]) {
  return parseEvents(lines).filter((x): x is Extract<ResourceApplyStreamEvent, { type: 'subSteps' }> => x.type === 'subSteps');
}

describe('DeploymentController', () => {
  it('should stream sub-steps and end with the result when the resource succeeds', async () => {
    const controller = createController(
      createResource(async (_id, _request, progress) => {
        progress.beginStep('First');
        progress.update('working');

        return { context: { key: 'value' }, connection: {} };
      }),
    );

    const { res, lines, state } = createResponse();
    await controller.applyResourceStreamed(request, res);

    const events = parseEvents(lines);
    const lastEvent = events[events.length - 1];

    expect(lastEvent).toMatchObject({ type: 'result', result: { context: { key: 'value' } } });
    expect(state.ended).toBe(true);

    const snapshots = parseSnapshots(lines);
    expect(snapshots[0].subSteps).toMatchObject([{ name: 'First', status: 'Running' }]);
    expect(snapshots[snapshots.length - 1].subSteps).toMatchObject([{ name: 'First', status: 'Completed', message: 'working' }]);
  });

  it('should fail the current sub-step and end with an error when the resource fails', async () => {
    const controller = createController(
      createResource(async (_id, _request, progress) => {
        progress.beginStep('First');

        throw new Error('boom');
      }),
    );

    const { res, lines, state } = createResponse();
    await controller.applyResourceStreamed(request, res);

    const events = parseEvents(lines);
    const lastEvent = events[events.length - 1];

    expect(lastEvent).toEqual({ type: 'error', error: 'boom' });
    expect(state.ended).toBe(true);

    const snapshots = parseSnapshots(lines);
    expect(snapshots[snapshots.length - 1].subSteps).toMatchObject([{ name: 'First', status: 'Failed', message: 'boom' }]);
  });

  it('should reject unknown resource types before streaming starts', async () => {
    const controller = createController(createResource(() => Promise.resolve({ context: {}, connection: {} })));

    const { res, lines } = createResponse();
    const promise = controller.applyResourceStreamed({ ...request, resourceType: 'unknown' } as ResourceRequestDto, res);

    await expect(promise).rejects.toThrow('Unknown resource type unknown');
    expect(lines).toEqual([]);
  });
});
