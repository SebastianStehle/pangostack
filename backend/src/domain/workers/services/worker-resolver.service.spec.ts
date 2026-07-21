import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { WorkerResolver } from './worker-resolver.service';

const { resourcesByEndpoint } = vi.hoisted(() => ({ resourcesByEndpoint: new Map<string, string[]>() }));

vi.mock('../client', () => ({
  WorkerClient: class {
    readonly resources: { getResources: () => Promise<{ items: { name: string; context: object }[] }> };

    constructor(readonly basePath: string) {
      this.resources = {
        getResources: async () => {
          const names = resourcesByEndpoint.get(basePath);
          if (!names) {
            throw new Error(`Worker ${basePath} is not reachable.`);
          }

          return { items: names.map((name) => ({ name, context: {} })) };
        },
      };
    }
  },
}));

describe('WorkerResolver', () => {
  let workers: WorkerEntity[];
  let resolver: WorkerResolver;

  beforeEach(() => {
    resourcesByEndpoint.clear();

    workers = [
      { id: 1, endpoint: 'http://worker1', apiKey: 'key1' },
      { id: 2, endpoint: 'http://worker2', apiKey: 'key2' },
    ] as WorkerEntity[];

    const repository = {
      find: async () => workers,
      count: async () => workers.length,
      findOneBy: async ({ endpoint }: Partial<WorkerEntity>) => workers.find((x) => x.endpoint === endpoint) ?? null,
    } as unknown as WorkerRepository;

    resolver = new WorkerResolver(repository);
  });

  it('should map each resource type to the worker that provides it', async () => {
    resourcesByEndpoint.set('http://worker1', ['vultr-vm']);
    resourcesByEndpoint.set('http://worker2', ['helm']);

    const result = await resolver.getWorkers();

    expect([...result].map(([type, { client }]) => [type, client.basePath])).toEqual([
      ['vultr-vm', 'http://worker1'],
      ['helm', 'http://worker2'],
    ]);
  });

  it('should keep the first worker when multiple workers provide the same resource type', async () => {
    resourcesByEndpoint.set('http://worker1', ['helm']);
    resourcesByEndpoint.set('http://worker2', ['helm']);

    const result = await resolver.getWorkers();

    expect(result.get('helm')?.client.basePath).toEqual('http://worker1');
  });

  it('should skip unreachable workers when mapping the resource types', async () => {
    resourcesByEndpoint.set('http://worker2', ['helm']);

    const result = await resolver.getWorkers();

    expect(result.get('helm')?.client.basePath).toEqual('http://worker2');
  });

  it('should return an empty map when no worker is registered', async () => {
    workers = [];

    const result = await resolver.getWorkers();

    expect(result.size).toEqual(0);
  });

  it('should create a client for a registered endpoint', async () => {
    const client = await resolver.clientForEndpoint('http://worker2');

    expect(client.basePath).toEqual('http://worker2');
  });

  it('should throw when the endpoint is not registered anymore', async () => {
    await expect(resolver.clientForEndpoint('http://gone')).rejects.toThrow(NotFoundException);
  });
});
