import { NodeSSH } from 'node-ssh';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { DockerComposeSshResource } from './index';

vi.mock('node-ssh', () => ({ NodeSSH: vi.fn() }));

const TIMEOUT_MS = 1000;

type Ssh = { connect: Mock; dispose: Mock; execCommand: Mock };

function createRequest(): ResourceRequest<any> {
  return {
    parameters: { host: 'host', sshUser: 'user', sshPassword: 'password', dockerComposeUrl: 'https://compose' },
    resourceContext: {},
    timeoutMs: TIMEOUT_MS,
  };
}

function setupSsh(outputs: Record<string, string>): Ssh {
  const ssh: Ssh = {
    connect: vi.fn().mockResolvedValue(undefined),
    dispose: vi.fn(),
    execCommand: vi.fn((command: string) => {
      const match = Object.entries(outputs).find(([prefix]) => command.startsWith(prefix));
      return Promise.resolve({ stdout: match ? match[1] : '' });
    }),
  };

  (NodeSSH as unknown as Mock).mockImplementation(function (this: void) {
    return ssh;
  });
  return ssh;
}

const DOCKER_PS = [
  '{"Names":"user-web","State":"running","Status":"Up 5 minutes"}',
  '{"Names":"user-db","State":"restarting","Status":"Restarting"}',
].join('\n');

describe('DockerComposeSshResource', () => {
  let resource: DockerComposeSshResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new DockerComposeSshResource();
  });

  it('should report container states when queried for status', async () => {
    setupSsh({ 'docker ps': DOCKER_PS });

    const status = await resource.status('id', createRequest());

    expect(status.workloads).toEqual([
      {
        name: 'Docker Compose',
        nodes: [
          { name: 'web', originalName: 'user-web', isReady: true, details: 'Up 5 minutes' },
          { name: 'db', originalName: 'user-db', isReady: false, details: 'Restarting' },
        ],
      },
    ]);
  });

  it('should convert docker stats when queried for metrics', async () => {
    setupSsh({
      'docker ps': DOCKER_PS,
      'docker stats': '{"Name":"user-web","CPUPerc":"12.34%","MemUsage":"512MiB / 1GiB"}',
    });

    const result = await resource.metrics('id', createRequest());

    expect(result.metrics).toEqual({
      containers: { running: 1, total: 2 },
      cpu: { 'user-web': 12.34 },
      memory: { 'user-web': 0.5 },
    });
  });

  it('should convert all size units and invalid values when containers report different stat formats', async () => {
    setupSsh({
      'docker ps': DOCKER_PS,
      'docker stats': [
        '{"Name":"a","CPUPerc":"150.5%","MemUsage":"2GiB / 4GiB"}',
        '{"Name":"b","CPUPerc":"abc","MemUsage":"100MB / 1GB"}',
        '{"Name":"c","MemUsage":"1048576KiB / 2TiB"}',
        '{"Name":"d","CPUPerc":"0.129%","MemUsage":"invalid"}',
      ].join('\n'),
    });

    const result = await resource.metrics('id', createRequest());

    expect(result.metrics.cpu).toEqual({ a: 150.5, b: 0, c: 0, d: 0.13 });
    expect(result.metrics.memory).toEqual({ a: 2, b: 0.1, c: 1, d: 0 });
  });
});
