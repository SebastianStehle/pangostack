import { NodeSSH } from 'node-ssh';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { VultrClient } from 'src/lib/vultr';
import { ResourceRequest } from '../interface';
import { VultrVmResource } from './index';

vi.mock('node-ssh', () => ({ NodeSSH: vi.fn() }));
vi.mock('src/lib/vultr', () => ({ VultrClient: vi.fn() }));

const TIMEOUT_MS = 1000;

const VM_ID = 'my-vm';

function createRequest(): ResourceRequest<any, any> {
  return {
    parameters: { apiKey: 'key', region: 'fra', plan: 'plan', app: 'app', backup: false },
    resourceContext: { password: 'secret' },
    timeoutMs: TIMEOUT_MS,
  };
}

function setupVultr(instances: unknown[]) {
  const client = {
    instances: {
      listInstances: vi.fn().mockResolvedValue({ instances, meta: { links: {} } }),
    },
  };

  (VultrClient as unknown as Mock).mockImplementation(function (this: void) {
    return client;
  });
  return client;
}

function setupSsh(outputs: Record<string, string>) {
  const ssh = {
    connect: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
    execCommand: vi.fn((command: string) => {
      const match = Object.entries(outputs).find(([part]) => command.includes(part));
      return Promise.resolve({ stdout: match ? match[1] : '' });
    }),
  };

  (NodeSSH as unknown as Mock).mockImplementation(function (this: void) {
    return ssh;
  });
  return ssh;
}

describe('VultrVmResource', () => {
  let resource: VultrVmResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new VultrVmResource();
  });

  it('should report ready when the instance is active and has an ip', async () => {
    setupVultr([{ label: VM_ID, serverStatus: 'ok', mainIp: '1.2.3.4' }]);

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: true, message: undefined }]);
  });

  it('should report failure when the instance cannot be found', async () => {
    setupVultr([]);

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: false, message: 'Instance not found' }]);
  });

  it('should report failure when the instance has no ip yet', async () => {
    setupVultr([{ label: VM_ID, serverStatus: 'ok', mainIp: '0.0.0.0' }]);

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([
      { name: 'Virtual Machine', isReady: false, message: 'Instance does not have a IP address yet' },
    ]);
  });

  it('should convert system stats when queried for metrics', async () => {
    setupVultr([{ label: VM_ID, serverStatus: 'ok', mainIp: '1.2.3.4' }]);
    setupSsh({
      meminfo: 'MemTotal:        2097152 kB\nMemAvailable:    1048576 kB',
      '/proc/stat': 'cpu  100 0 100 800 0 0 0 0 0 0\ncpu  200 0 200 1400 0 0 0 0 0 0',
      'df -kP': 'Filesystem 1024-blocks Used Available Capacity Mounted on\n/dev/vda1 10485760 5242880 5242880 50% /',
    });

    const result = await resource.metrics(VM_ID, createRequest());

    expect(result.metrics).toEqual({
      memory: { used: 1, total: 2 },
      cpu: { usage: 25 },
      disk: { used: 5, total: 10 },
    });
  });

  it('should report zero metrics when the command outputs are empty', async () => {
    setupVultr([{ label: VM_ID, serverStatus: 'ok', mainIp: '1.2.3.4' }]);
    setupSsh({});

    const result = await resource.metrics(VM_ID, createRequest());

    expect(result.metrics).toEqual({
      memory: { used: 0, total: 0 },
      cpu: { usage: 0 },
      disk: { used: 0, total: 0 },
    });
  });
});
