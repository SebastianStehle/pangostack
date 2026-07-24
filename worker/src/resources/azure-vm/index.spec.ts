import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { AzureVmResource } from './index';

const { getMock, instanceViewMock } = vi.hoisted(() => ({ getMock: vi.fn(), instanceViewMock: vi.fn() }));

vi.mock('@azure/arm-compute', () => ({
  ComputeManagementClient: class {
    virtualMachines = { get: getMock, instanceView: instanceViewMock };
  },
}));
vi.mock('@azure/arm-network', () => ({ NetworkManagementClient: class {} }));
vi.mock('@azure/arm-resources', () => ({ ResourceManagementClient: class {} }));
vi.mock('@azure/identity', () => ({ ClientSecretCredential: class {} }));

const VM_ID = 'my-vm';

function createRequest(): ResourceRequest<any, any> {
  return {
    parameters: {
      tenantId: 'tenant',
      clientId: 'client',
      clientSecret: 'secret',
      subscriptionId: 'sub',
      resourceGroup: 'rg',
      location: 'westeurope',
      vmSize: 'Standard_B1s',
      adminUser: 'azureuser',
      image: 'Canonical:ubuntu:22_04-lts:latest',
    },
    resourceContext: { password: 'secret' },
    timeoutMs: 1000,
  };
}

describe('AzureVmResource', () => {
  let resource: AzureVmResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new AzureVmResource();
  });

  it('should report ready when the machine exists and is running', async () => {
    getMock.mockResolvedValue({ name: VM_ID });
    instanceViewMock.mockResolvedValue({ statuses: [{ code: 'PowerState/running' }] });

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: true, message: undefined }]);
  });

  it('should report failure when the machine cannot be found', async () => {
    getMock.mockRejectedValue({ statusCode: 404 });

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Virtual Machine', isReady: false, message: 'Virtual machine not found' }]);
  });

  it('should report failure when the machine is not running', async () => {
    getMock.mockResolvedValue({ name: VM_ID });
    instanceViewMock.mockResolvedValue({ statuses: [{ code: 'PowerState/stopped' }] });

    const status = await resource.status(VM_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([
      { name: 'Virtual Machine', isReady: false, message: 'Virtual machine is not running, got PowerState/stopped' },
    ]);
  });
});
