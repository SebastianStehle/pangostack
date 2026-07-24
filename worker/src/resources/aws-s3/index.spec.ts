import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { AwsS3Resource } from './index';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    send = sendMock;
  },
  HeadBucketCommand: vi.fn(),
  CreateBucketCommand: vi.fn(),
  DeleteBucketCommand: vi.fn(),
  ListObjectsV2Command: vi.fn(),
  BucketAlreadyOwnedByYou: class BucketAlreadyOwnedByYou {},
  BucketLocationConstraint: {},
}));

const BUCKET_ID = 'my-bucket';

function createRequest(): ResourceRequest<any> {
  return {
    parameters: { accessKeyId: 'key', secretAccessKey: 'secret', region: 'eu-central-1', bucket: BUCKET_ID },
    resourceContext: {},
    timeoutMs: 1000,
  };
}

describe('AwsS3Resource', () => {
  let resource: AwsS3Resource;

  beforeEach(() => {
    vi.clearAllMocks();
    resource = new AwsS3Resource();
  });

  it('should report ready when the bucket is accessible', async () => {
    sendMock.mockResolvedValue({});

    const status = await resource.status(BUCKET_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Object Storage', isReady: true, message: undefined }]);
  });

  it('should report failure when the bucket does not exist', async () => {
    sendMock.mockRejectedValue({ $metadata: { httpStatusCode: 404 } });

    const status = await resource.status(BUCKET_ID, createRequest());

    expect(status.workloads[0].nodes).toEqual([{ name: 'Object Storage', isReady: false, message: 'Bucket not found' }]);
  });
});
