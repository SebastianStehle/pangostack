import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { DeploymentUpdateRepository } from 'src/domain/database';
import { WorkerClient, WorkerResolver } from 'src/domain/workers';
import { GetResourceWorkersActivity } from './get-resource-workers';

describe('GetResourceWorkersActivity', () => {
  const definition = {
    resources: [
      { id: 'vm1', type: 'vultr-vm' },
      { id: 'chart', type: 'helm' },
      { id: 'vm2', type: 'vultr-vm' },
    ],
  };

  let workers: Map<string, { client: WorkerClient }>;
  let activity: GetResourceWorkersActivity;

  beforeEach(() => {
    workers = new Map([
      ['vultr-vm', { client: { basePath: 'http://worker1' } as WorkerClient }],
      ['helm', { client: { basePath: 'http://worker2' } as WorkerClient }],
    ]);

    const deploymentUpdates = {
      findOne: async () => ({ serviceVersion: { definition } }),
    } as unknown as DeploymentUpdateRepository;

    const workerResolver = { getWorkers: async () => workers } as unknown as WorkerResolver;

    activity = new GetResourceWorkersActivity(deploymentUpdates, workerResolver);
  });

  it('should map each requested resource id to the endpoint of its worker', async () => {
    const result = await activity.execute({ resourceIds: ['vm1', 'chart', 'vm2'], updateId: 1 });

    expect(result).toEqual({ vm1: 'http://worker1', chart: 'http://worker2', vm2: 'http://worker1' });
  });

  it('should resolve only the requested resources', async () => {
    const result = await activity.execute({ resourceIds: ['chart'], updateId: 1 });

    expect(result).toEqual({ chart: 'http://worker2' });
  });

  it('should skip resources whose type no worker provides', async () => {
    workers.delete('helm');

    const result = await activity.execute({ resourceIds: ['vm1', 'chart'], updateId: 1 });

    expect(result).toEqual({ vm1: 'http://worker1' });
  });

  it('should throw when the update does not exist', async () => {
    const deploymentUpdates = { findOne: async () => null } as unknown as DeploymentUpdateRepository;
    activity = new GetResourceWorkersActivity(deploymentUpdates, { getWorkers: async () => workers } as never);

    await expect(activity.execute({ resourceIds: ['vm1'], updateId: 99 })).rejects.toThrow(NotFoundException);
  });
});
