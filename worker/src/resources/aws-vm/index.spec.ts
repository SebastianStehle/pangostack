import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { AwsVmResource } from './index';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock('@aws-sdk/client-ec2', () => ({
  EC2Client: class {
    send = sendMock;
  },
  DescribeInstancesCommand: vi.fn(),
  RunInstancesCommand: vi.fn(),
  TerminateInstancesCommand: vi.fn(),
}));

const VM_ID = 'my-vm';

function createRequest(): ResourceRequest<any, any> {
  return {
    parameters: {
      accessKeyId: 'key',
      secretAccessKey: 'secret',
      region: 'eu-central-1',
      imageId: 'ami-1',
      instanceType: 't3.small',
      sshUser: 'ubuntu',
    },
    resourceContext: { password: 'secret' },
    timeoutMs: 1000,
  };
}

function setupInstances(instances: unknown[]) {
  sendMock.mockResolvedValue({ Reservations: instances.length ? [{ Instances: instances }] : [] });
}

describe('AwsVmResource', () => {
  let resource: AwsVmResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new AwsVmResource();
  });

  it('should report ready when the instance is running and has a public ip', async () => {
    setupInstances([{ InstanceId: 'i-1', State: { Name: 'running' }, PublicIpAddress: '1.2.3.4' }]);

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: true, message: undefined }]);
  });

  it('should report failure when the instance cannot be found', async () => {
    setupInstances([]);

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: false, message: 'Instance not found' }]);
  });

  it('should report failure when the instance has no public ip yet', async () => {
    setupInstances([{ InstanceId: 'i-1', State: { Name: 'running' } }]);

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([
      { name: 'Virtual Machine', isReady: false, message: 'Instance does not have a public IP address yet' },
    ]);
  });
});
