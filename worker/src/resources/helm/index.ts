import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as k8s from '@kubernetes/client-node';
import { Injectable } from '@nestjs/common';
import { execa } from 'execa';
import { v4 as uuidv4 } from 'uuid';
import { stringify as toYAML } from 'yaml';
import { dotToNested } from 'src/lib';
import {
  defineResource,
  Resource,
  ResourceApplyResult,
  ResourceLogResult,
  ResourceMetricsResult,
  ResourceRequest,
  ResourceStatusResult,
  ResourceWorkloadStatus,
} from '../interface';

type Parameters = {
  config: string;
  repositoryUrl: string;
  repositoryName: string;
  chartName: string;
  chartVersion: string;
};

@Injectable()
export class HelmResource implements Resource {
  descriptor = defineResource<Parameters, any>({
    name: 'helm',
    description: 'Deploys a Helm chart to a Kubernetes cluster.',
    parameters: {
      config: {
        description: 'The kubernetes config.',
        type: 'string',
        required: true,
      },
      repositoryUrl: {
        description: 'The custom repository URL.',
        type: 'string',
        required: true,
      },
      repositoryName: {
        description: 'The name of the custom repository.',
        type: 'string',
        required: true,
      },
      chartName: {
        description: 'The name of the chart.',
        type: 'string',
        required: true,
      },
      chartVersion: {
        description: 'The version of the chart.',
        type: 'string',
        required: true,
      },
    },
    context: {},
    metrics: {
      pods: {
        description: 'The number of ready pods in the namespace.',
      },
      restarts: {
        description: 'The number of container restarts per pod.',
      },
      memory: {
        description: 'The memory usage per pod in GB. Requires the metrics server.',
      },
      cpu: {
        description: 'The CPU usage per pod in cores. Requires the metrics server.',
      },
    },
  });

  async apply(id: string, request: ResourceRequest<Parameters>): Promise<ResourceApplyResult> {
    const { config, repositoryUrl, repositoryName, chartName, chartVersion, ...others } = request.parameters;

    const k8 = await this.getK8Service(config);
    try {
      await execa('helm', ['repo', 'add', repositoryName, repositoryUrl]);
      await execa('helm', ['repo', 'update']);

      // The namespace also identifies the resource.
      const namespace = getNamespace(id);

      // Allow chart names with and without repository prefix.
      let fullChartName = chartName;
      if (fullChartName.indexOf(repositoryName) < 0) {
        fullChartName = `${repositoryName}/${chartName}`;
      }

      const args = [
        'upgrade',
        namespace,
        fullChartName,
        '--version',
        chartVersion,
        '--install',
        '--namespace',
        namespace,
        '--create-namespace',
        '--reset-values',
        '--set',
        'global.security.allowInsecureImages=true',
      ];

      let valuesFilePath: string | null = null;
      if (Object.keys(others).length > 0) {
        const nested = dotToNested(others);

        const tempDir = os.tmpdir();
        const tempPath = path.join(tempDir, `kubeconfig-${uuidv4()}.yaml`);
        const yaml = toYAML(nested);

        await fs.writeFile(tempPath, yaml);
        args.push('-f', tempPath);
        valuesFilePath = tempPath;
      }

      try {
        const { stdout, stderr } = await execa('helm', args);

        return {
          log: stdout + '\n' + stderr,
          context: {},
          connection: {
            namespace: {
              value: namespace,
              label: 'Namespace',
              isPublic: false,
            },
            config: {
              value: config,
              label: 'Kubernetes Config',
              isPublic: false,
            },
          },
        };
      } finally {
        if (valuesFilePath) {
          await fs.rm(valuesFilePath);
        }
      }
    } finally {
      await k8.cleanup();
    }
  }

  async delete(id: string, request: ResourceRequest<Parameters>): Promise<void> {
    const { config } = request.parameters;

    const k8 = await this.getK8Service(config);
    try {
      // The namespace also identifies the resource.
      const namespace = getNamespace(id);

      await execa('helm', ['uninstall', namespace, '--namespace', namespace, '--ignore-not-found']);
    } finally {
      await k8.cleanup();
    }
  }

  async status(id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { config, chartName } = request.parameters;
    const k8 = await this.getK8Service(config);

    const result: ResourceStatusResult = { workloads: [] };
    try {
      // The namespace also identifies the resource.
      const namespace = getNamespace(id);

      // Only query the pods once, because we can reuse them for replica sets and filters.
      const [deployments, statefulSets, pods] = await Promise.all([
        k8.v1Apps.listNamespacedDeployment({ namespace: namespace }),
        k8.v1Apps.listNamespacedStatefulSet({ namespace: namespace }),
        k8.v1Core.listNamespacedPod({ namespace: namespace }),
      ]);

      const addResource = (resource: k8s.V1StatefulSet | k8s.V1Deployment) => {
        const name = resource.metadata?.name;
        if (!name) {
          return;
        }

        const workloadResult: ResourceWorkloadStatus = {
          name,
          nodes: [],
        };

        const selector = resource.spec?.selector?.matchLabels;
        if (selector) {
          const matchingPods = pods.items.filter((pod) => matchesSelector(pod.metadata?.labels, selector));
          for (const pod of matchingPods) {
            const podName = pod.metadata?.name;
            if (!podName) {
              continue;
            }

            workloadResult.nodes.push({ name: getPodName(podName, namespace, chartName), isReady: isPodReady(pod.status) });
          }
        }

        result.workloads.push(workloadResult);
      };

      for (const statefulSet of statefulSets.items) {
        addResource(statefulSet);
      }

      for (const deployment of deployments.items) {
        addResource(deployment);
      }
    } finally {
      await k8.cleanup();
    }

    return result;
  }

  async metrics(id: string, request: ResourceRequest<Parameters>): Promise<ResourceMetricsResult> {
    const { config, chartName } = request.parameters;
    const k8 = await this.getK8Service(config);

    try {
      // The namespace also identifies the resource.
      const namespace = getNamespace(id);

      const pods = await k8.v1Core.listNamespacedPod({ namespace });

      const total = pods.items.length;
      const ready = pods.items.filter((pod) => isPodReady(pod.status)).length;

      const restarts: Record<string, number> = {};
      for (const pod of pods.items) {
        const podName = pod.metadata?.name;
        if (!podName) {
          continue;
        }

        const containerStatuses = pod.status?.containerStatuses || [];

        restarts[getPodName(podName, namespace, chartName)] = containerStatuses.reduce((a, c) => a + (c.restartCount || 0), 0);
      }

      const memory: Record<string, number> = {};
      const cpu: Record<string, number> = {};
      try {
        const podMetrics = await k8.metrics.getPodMetrics(namespace);

        for (const item of podMetrics.items) {
          const name = getPodName(item.metadata.name, namespace, chartName);

          let memoryBytes = 0;
          let cpuCores = 0;
          for (const container of item.containers) {
            memoryBytes += parseK8sQuantity(container.usage.memory);
            cpuCores += parseK8sQuantity(container.usage.cpu);
          }

          memory[name] = roundValue(memoryBytes / 1024 ** 3);
          cpu[name] = roundValue(cpuCores);
        }
      } catch {
        // The metrics server is optional, therefore usage metrics might not be available.
      }

      return {
        metrics: {
          pods: { ready, total },
          restarts,
          memory,
          cpu,
        },
      };
    } finally {
      await k8.cleanup();
    }
  }

  async log(id: string, request: ResourceRequest<Parameters>): Promise<ResourceLogResult> {
    const { chartName, config } = request.parameters;
    const k8 = await this.getK8Service(config);

    const result: ResourceLogResult = { instances: [] };
    try {
      const namespace = getNamespace(id);

      const pods = await k8.v1Core.listNamespacedPod({ namespace });
      for (const pod of pods.items) {
        const podName = pod.metadata?.name;
        if (!podName) {
          continue;
        }

        const messages = await k8.v1Core.readNamespacedPodLog({
          name: podName,
          namespace,
        });

        result.instances.push({ instanceId: getPodName(podName, namespace, chartName), messages });
      }

      return result;
    } finally {
      await k8.cleanup();
    }
  }

  private async getK8Service(config?: string) {
    let cleanup = () => {
      return Promise.resolve();
    };

    if (config) {
      const tempDir = os.tmpdir();
      const tempPath = path.join(tempDir, `kubeconfig-${uuidv4()}.yaml`);

      // Write the kubeconfig string to the file
      await fs.writeFile(tempPath, config, { encoding: 'utf8' });

      // Set the KUBECONFIG environment variable
      process.env.KUBECONFIG = tempPath;

      cleanup = async () => {
        await fs.rm(tempPath);
      };
    }

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const v1Apps = kc.makeApiClient(k8s.AppsV1Api);
    const v1Core = kc.makeApiClient(k8s.CoreV1Api);

    const metrics = new k8s.Metrics(kc);

    return { v1Core, v1Apps, metrics, cleanup };
  }
}

const QUANTITY_FACTORS: Record<string, number> = {
  n: 1e-9,
  u: 1e-6,
  m: 1e-3,
  k: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
  Ti: 1024 ** 4,
};

function parseK8sQuantity(source: string | undefined): number {
  const match = /^([\d.]+)([a-zA-Z]*)$/.exec(source?.trim() || '');
  if (!match) {
    return 0;
  }

  const factor = match[2] ? (QUANTITY_FACTORS[match[2]] ?? 0) : 1;

  return parseFloat(match[1]) * factor;
}

function roundValue(value: number): number {
  return Math.round(value * 100) / 100;
}

function getNamespace(id: string) {
  const trimmedId = id
    .toLowerCase() // 1. Lowercase
    .replace(/[^a-z0-9.-]/g, '-') // 2. Replace invalid chars with `-`
    .replace(/^[^a-z0-9]+/, '') // 3. Trim leading non-alphanum
    .replace(/[^a-z0-9]+$/, '') // 3. Trim trailing non-alphanum
    .slice(0, 53) // 4. Max 53 chars
    .replace(/[^a-z0-9]+$/, ''); // 5. Re-trim trailing non-alphanum (again after slicing)

  return `resource-${trimmedId}`;
}

function getPodName(podName: string, namespace: string, chartName: string): string {
  const lastPart = chartName.split('/');

  if (podName.startsWith(`${namespace}-`)) {
    podName = podName.substring(namespace.length + 1);
  }

  return `${lastPart[lastPart.length - 1]}-${podName}`;
}

function isPodReady(status?: k8s.V1PodStatus): boolean {
  if (!status?.conditions) {
    return false;
  }

  return status.conditions.some((cond) => cond.type === 'Ready' && cond.status === 'True');
}

function matchesSelector(podLabels: { [key: string]: string } = {}, selector: { [key: string]: string }): boolean {
  return Object.entries(selector).every(([key, val]) => podLabels[key] === val);
}
