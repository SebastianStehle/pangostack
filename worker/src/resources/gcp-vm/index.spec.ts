import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { GcpVmResource } from './index';

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));

vi.mock('@google-cloud/compute', () => ({
  protos: {},
  InstancesClient: class {
    get = getMock;
  },
  ZoneOperationsClient: class {},
}));

const VM_ID = 'my-vm';

function createRequest(): ResourceRequest<any, any> {
  return {
    parameters: {
      credentialsJson: '{}',
      projectId: 'project',
      zone: 'europe-west1-b',
      machineType: 'e2-small',
      image: 'projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts',
      sshUser: 'deploy',
    },
    resourceContext: { password: 'secret' },
    timeoutMs: 1000,
  };
}

function setupInstance(instance: unknown) {
  getMock.mockResolvedValue([instance]);
}

describe('GcpVmResource', () => {
  let resource: GcpVmResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new GcpVmResource();
  });

  it('should report ready when the instance is running and has an external ip', async () => {
    setupInstance({ status: 'RUNNING', networkInterfaces: [{ accessConfigs: [{ natIP: '1.2.3.4' }] }] });

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: true, message: undefined }]);
  });

  it('should report failure when the instance cannot be found', async () => {
    getMock.mockRejectedValue({ code: 5 });

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: false, message: 'Instance not found' }]);
  });

  it('should report failure when the instance has no external ip yet', async () => {
    setupInstance({ status: 'RUNNING', networkInterfaces: [{ accessConfigs: [{}] }] });

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([
      { name: 'Virtual Machine', isReady: false, message: 'Instance does not have an external IP address yet' },
    ]);
  });
});
