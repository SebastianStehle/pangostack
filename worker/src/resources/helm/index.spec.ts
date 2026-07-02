import * as k8s from '@kubernetes/client-node';
import { execa } from 'execa';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { ResourceRequest } from '../interface';
import { HelmResource } from './index';

vi.mock('execa', () => ({ execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }) }));
vi.mock('@kubernetes/client-node', () => ({
  KubeConfig: vi.fn(),
  AppsV1Api: class {},
  CoreV1Api: class {},
  Metrics: vi.fn(),
}));

const TIMEOUT_MS = 1000;

function createRequest(): ResourceRequest<any> {
  return {
    parameters: {
      config: 'apiVersion: v1',
      repositoryUrl: 'https://charts.example.com',
      repositoryName: 'repo',
      chartName: 'repo/mychart',
      chartVersion: '1.0.0',
    },
    resourceContext: {},
    timeoutMs: TIMEOUT_MS,
  };
}

const v1Apps = { listNamespacedDeployment: vi.fn(), listNamespacedStatefulSet: vi.fn() };
const v1Core = { listNamespacedPod: vi.fn() };

const getPodMetrics = vi.fn();

describe('HelmResource', () => {
  let resource: HelmResource;

  beforeEach(() => {
    vi.clearAllMocks();

    (k8s.KubeConfig as unknown as Mock).mockImplementation(function (this: void) {
      return {
        loadFromDefault: vi.fn(),
        makeApiClient: (api: unknown) => (api === k8s.AppsV1Api ? v1Apps : v1Core),
      };
    });

    (k8s.Metrics as unknown as Mock).mockImplementation(function (this: void) {
      return { getPodMetrics };
    });

    resource = new HelmResource();
  });

  it('should uninstall with a sanitized namespace when the id contains invalid characters', async () => {
    await resource.delete('My Deployment!', createRequest());

    const namespace = 'resource-my-deployment';
    expect(execa).toHaveBeenCalledWith('helm', ['uninstall', namespace, '--namespace', namespace, '--ignore-not-found']);
  });

  it('should report pods of matching workloads when queried for status', async () => {
    v1Apps.listNamespacedStatefulSet.mockResolvedValue({ items: [] });
    v1Apps.listNamespacedDeployment.mockResolvedValue({
      items: [{ metadata: { name: 'web' }, spec: { selector: { matchLabels: { app: 'web' } } } }],
    });
    v1Core.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: 'resource-app-web-0', labels: { app: 'web' } },
          status: { conditions: [{ type: 'Ready', status: 'True' }] },
        },
        {
          metadata: { name: 'resource-app-other-0', labels: { app: 'other' } },
          status: { conditions: [] },
        },
      ],
    });

    const status = await resource.status('app', createRequest());

    expect(status.workloads).toEqual([{ name: 'web', nodes: [{ name: 'mychart-web-0', isReady: true }] }]);
  });

  it('should convert kubernetes quantities and restarts when queried for metrics', async () => {
    v1Core.listNamespacedPod.mockResolvedValue({
      items: [
        {
          metadata: { name: 'resource-app-web-0' },
          status: { conditions: [{ type: 'Ready', status: 'True' }], containerStatuses: [{ restartCount: 2 }, { restartCount: 1 }] },
        },
        {
          metadata: { name: 'resource-app-db-0' },
          status: { conditions: [] },
        },
      ],
    });
    getPodMetrics.mockResolvedValue({
      items: [
        {
          metadata: { name: 'resource-app-web-0' },
          containers: [{ usage: { memory: '1Gi', cpu: '250m' } }, { usage: { memory: '512Mi', cpu: '1' } }],
        },
      ],
    });

    const result = await resource.metrics('app', createRequest());

    expect(result.metrics).toEqual({
      pods: { ready: 1, total: 2 },
      restarts: { 'mychart-web-0': 3, 'mychart-db-0': 0 },
      memory: { 'mychart-web-0': 1.5 },
      cpu: { 'mychart-web-0': 1.25 },
    });
  });

  it('should omit usage metrics when the metrics server is not installed', async () => {
    v1Core.listNamespacedPod.mockResolvedValue({ items: [] });
    getPodMetrics.mockRejectedValue(new Error('metrics server not installed'));

    const result = await resource.metrics('app', createRequest());

    expect(result.metrics).toEqual({ pods: { ready: 0, total: 0 }, restarts: {}, memory: {}, cpu: {} });
  });
});
