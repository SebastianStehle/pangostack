import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as k8s from '@kubernetes/client-node';
import { Injectable } from '@nestjs/common';
import { execa } from 'execa';
import { v4 as uuidv4 } from 'uuid';
import { stringify as toYAML } from 'yaml';
import {
  Resource,
  ResourceApplyResult,
  ResourceDescriptor,
  ResourceNodeStatus,
  ResourceRequest,
  ResourceStatusResult,
  ResourceUsage,
  ResourceWorkloadStatus,
} from '../interface';

@Injectable()
export class HelmResource implements Resource {
  descriptor: ResourceDescriptor = {
    name: 'helm',
    description: 'Creates a vultr storage account',
    parameters: {
      config: {
        description: 'The kubernetes config',
        type: 'string',
        required: true,
      },
      repositoryUrl: {
        description: 'The custom repository URL',
        type: 'string',
        required: true,
      },
      repositoryName: {
        description: 'The n ame of the custom repository',
        type: 'string',
        required: true,
      },
      chartName: {
        description: 'The name of the chart',
        type: 'string',
        required: true,
      },
      chartVersion: {
        description: 'The version of the chart',
        type: 'string',
        required: true,
      },
    },
  };

  async apply(id: string, request: ResourceRequest): Promise<ResourceApplyResult> {
    const { config, repositoryUrl, repositoryName, chartName, chartVersion, ...others } = request.parameters as {
      config: string;
      repositoryUrl: string;
      repositoryName: string;
      chartName: string;
      chartVersion: string;
    };

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
      ];

      let valuesFilePath: string | null = null;
      if (Object.keys(others).length > 0) {
        const tempDir = os.tmpdir();
        const tempPath = path.join(tempDir, `kubeconfig-${uuidv4()}.yaml`);

        await fs.writeFile(tempPath, toYAML(others));
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
            },
            config: {
              value: config,
              label: 'Kubernetes Config',
            },
          },
        };
      } finally {
        if (valuesFilePath) {
          fs.rm(valuesFilePath);
        }
      }
    } finally {
      await k8.cleanup();
    }
  }

  async delete(id: string, request: ResourceRequest): Promise<void> {
    const { config } = request.parameters as {
      config: string;
    };

    const k8 = await this.getK8Service(config);
    try {
      // The namespace also identifies the resource.
      const namespace = getNamespace(id);

      await execa('helm', ['uninstall', namespace, '--namespace', namespace]);
    } finally {
      await k8.cleanup();
    }
  }

  usage(): Promise<ResourceUsage> {
    return Promise.resolve({ totalStorageGB: 0 });
  }

  async status(id: string, request: ResourceRequest): Promise<ResourceStatusResult> {
    const { config } = request.parameters as { config: string };
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
        const workloadResult: ResourceWorkloadStatus = {
          name: resource.metadata?.name,
          nodes: [],
        };

        const selector = resource.spec?.selector?.matchLabels;
        if (selector) {
          const matchingPods = pods.items.filter((pod) => matchesSelector(pod.metadata?.labels, selector));
          for (const pod of matchingPods) {
            const node: ResourceNodeStatus = { name: pod.metadata.name, isReady: isPodReady(pod.status) };

            workloadResult.nodes.push(node);
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

    return { v1Core, v1Apps, cleanup };
  }
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

function isPodReady(status?: k8s.V1PodStatus): boolean {
  if (!status?.conditions) {
    return false;
  }

  return status.conditions.some((cond) => cond.type === 'Ready' && cond.status === 'True');
}

function matchesSelector(podLabels: { [key: string]: string } = {}, selector: { [key: string]: string }): boolean {
  return Object.entries(selector).every(([key, val]) => podLabels[key] === val);
}
