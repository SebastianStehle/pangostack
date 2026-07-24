import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { AzureBlobResource } from './index';

const { existsMock } = vi.hoisted(() => ({ existsMock: vi.fn() }));

vi.mock('@azure/storage-blob', () => ({
  StorageSharedKeyCredential: class {},
  BlobServiceClient: class {
    getContainerClient() {
      return { exists: existsMock, url: 'https://account.blob.core.windows.net/data' };
    }
  },
}));

const CONTAINER_ID = 'my-container';

function createRequest(): ResourceRequest<any> {
  return {
    parameters: { accountName: 'account', accountKey: 'key', container: CONTAINER_ID },
    resourceContext: {},
    timeoutMs: 1000,
  };
}

describe('AzureBlobResource', () => {
  let resource: AzureBlobResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new AzureBlobResource();
  });

  it('should report ready when the container exists', async () => {
    existsMock.mockResolvedValue(true);

    const status = await resource.status(CONTAINER_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Blob Storage', isReady: true, message: undefined }]);
  });

  it('should report failure when the container does not exist', async () => {
    existsMock.mockResolvedValue(false);

    const status = await resource.status(CONTAINER_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Blob Storage', isReady: false, message: 'Container not found' }]);
  });
});
