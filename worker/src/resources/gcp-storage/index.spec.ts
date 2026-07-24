import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { GcpStorageResource } from './index';

const { existsMock } = vi.hoisted(() => ({ existsMock: vi.fn() }));

vi.mock('@google-cloud/storage', () => ({
  Storage: class {
    bucket() {
      return { exists: existsMock };
    }
  },
}));

const BUCKET_ID = 'my-bucket';

function createRequest(): ResourceRequest<any> {
  return {
    parameters: { credentialsJson: '{}', projectId: 'project', bucket: BUCKET_ID },
    resourceContext: {},
    timeoutMs: 1000,
  };
}

describe('GcpStorageResource', () => {
  let resource: GcpStorageResource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new GcpStorageResource();
  });

  it('should report ready when the bucket exists', async () => {
    existsMock.mockResolvedValue([true]);

    const status = await resource.status(BUCKET_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Object Storage', isReady: true, message: undefined }]);
  });

  it('should report failure when the bucket does not exist', async () => {
    existsMock.mockResolvedValue([false]);

    const status = await resource.status(BUCKET_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Object Storage', isReady: false, message: 'Bucket not found' }]);
  });
});
