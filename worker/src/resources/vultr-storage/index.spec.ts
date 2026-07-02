import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { VultrClient } from 'src/lib/vultr';
import { ResourceRequest } from '../interface';
import { VultrStorageResource } from './index';

vi.mock('src/lib/vultr', () => ({ VultrClient: vi.fn() }));

const TIMEOUT_MS = 1000;
const STORAGE_ID = 'my-storage';

function createRequest(): ResourceRequest<any> {
  return {
    parameters: { apiKey: 'key', cluster: 1, tier: 2 },
    resourceContext: {},
    timeoutMs: TIMEOUT_MS,
  };
}

function setupVultr(objectStorages: unknown[]) {
  const client = {
    objectStorages: {
      listObjectStorages: vi.fn().mockResolvedValue({ objectStorages, meta: { links: {} } }),
    },
  };

  (VultrClient as unknown as Mock).mockImplementation(function (this: void) {
    return client;
  });
  return client;
}

describe('VultrStorageResource', () => {
  let resource: VultrStorageResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new VultrStorageResource();
  });

  it('should report ready when the storage is active', async () => {
    setupVultr([{ label: STORAGE_ID, status: 'active' }]);

    const status = await resource.status(STORAGE_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Object Storage', isReady: true, message: undefined }]);
  });

  it('should report failure when the storage cannot be found', async () => {
    setupVultr([{ label: 'other-storage', status: 'active' }]);

    const status = await resource.status(STORAGE_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Object Storage', isReady: false, message: 'Storage not found' }]);
  });

  it('should report zero usage when no bucket is configured', async () => {
    setupVultr([]);

    const usage = await resource.usage(STORAGE_ID, createRequest());

    expect(usage).toEqual({ totalStorageGB: 0 });
  });
});
