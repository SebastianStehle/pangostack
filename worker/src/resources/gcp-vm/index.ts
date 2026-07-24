import { InstancesClient, protos, ZoneOperationsClient } from '@google-cloud/compute';
import { Injectable } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { buildPasswordCloudInit, collectVmMetrics, generatePassword, pollUntil } from 'src/lib';
import { defineResource, Resource, ResourceMetricsResult, ResourceReporter, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = {
  credentialsJson: string;
  projectId: string;
  zone: string;
  machineType: string;
  image: string;
  sshUser: string;
};

type Context = { host: string; sshUser: string; sshPassword: string };

type ResourceContext = { password: string };

type Instance = protos.google.cloud.compute.v1.IInstance;

const GRPC_NOT_FOUND = 5;

@Injectable()
export class GcpVmResource implements Resource {
  descriptor = defineResource<Parameters, Context>({
    name: 'gcp-vm',
    description: 'Creates a Google Cloud Compute Engine virtual machine.',
    parameters: {
      credentialsJson: {
        description: 'The service account key as a JSON string.',
        type: 'string',
        required: true,
      },
      projectId: {
        description: 'The Google Cloud project id.',
        type: 'string',
        required: true,
      },
      zone: {
        description: 'The zone, for example europe-west1-b.',
        type: 'string',
        required: true,
      },
      machineType: {
        description: 'The machine type, for example e2-small.',
        type: 'string',
        required: true,
      },
      image: {
        description: 'The source image, for example projects/ubuntu-os-cloud/global/images/family/ubuntu-2204-lts.',
        type: 'string',
        required: true,
      },
      sshUser: {
        description: 'The SSH user to create on the machine.',
        type: 'string',
        required: true,
      },
    },
    context: {
      host: {
        description: 'The Host name.',
        type: 'string',
        required: true,
      },
      sshUser: {
        description: 'The name of the SSH user.',
        type: 'string',
        required: true,
      },
      sshPassword: {
        description: 'The password of the SSH user.',
        type: 'string',
        required: true,
      },
    },
    metrics: {
      memory: {
        description: 'The memory usage of the virtual machine in GB.',
      },
      cpu: {
        description: 'The CPU usage of the virtual machine in percent.',
      },
      disk: {
        description: 'The root disk usage of the virtual machine in GB.',
      },
    },
  });

  async apply(id: string, request: ResourceRequest<Parameters, ResourceContext>, reporter: ResourceReporter): Promise<void> {
    const { projectId, zone, sshUser } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    reporter.beginStep('Creating instance');

    let instance = await getInstance(clients.instances, projectId, zone, name);
    if (!instance) {
      const password = generatePassword();
      request.resourceContext.password = password;

      // Persist the password before the (long) provisioning, so a retry can reuse this instance instead of orphaning it.
      reporter.appendResourceContext(request.resourceContext);

      await this.createInstance(clients, request.parameters, name, password);
      instance = await getInstance(clients.instances, projectId, zone, name);
    }

    const host = externalIp(instance);
    if (!host) {
      throw new Error(`Instance ${name} does not have an external IP address.`);
    }

    const ssh = new NodeSSH();
    reporter.beginStep('Waiting for SSH connection');
    await pollUntil(request.timeoutMs, async () => {
      await ssh.connect({ host, username: sshUser, password: request.resourceContext.password });
      return true;
    });
    ssh.dispose();

    reporter.appendContext({
      host,
      sshUser,
      sshPassword: request.resourceContext.password,
    });

    reporter.appendConnection({
      ip: {
        value: host,
        label: 'IP Address',
        isPublic: true,
      },
    });
  }

  private async createInstance(clients: GcpClients, parameters: Parameters, name: string, password: string) {
    const { projectId, zone, machineType, image, sshUser } = parameters;

    const [operation] = await clients.instances.insert({
      project: projectId,
      zone,
      instanceResource: {
        name,
        machineType: `zones/${zone}/machineTypes/${machineType}`,
        disks: [{ boot: true, autoDelete: true, initializeParams: { sourceImage: image } }],
        networkInterfaces: [{ name: 'global/networks/default', accessConfigs: [{ name: 'External NAT', type: 'ONE_TO_ONE_NAT' }] }],
        metadata: { items: [{ key: 'user-data', value: buildPasswordCloudInit(sshUser, password) }] },
      },
    });

    await waitForOperation(clients.operations, projectId, zone, operation.latestResponse.name!);
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const { projectId, zone } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    try {
      const [operation] = await clients.instances.delete({ project: projectId, zone, instance: name });
      await waitForOperation(clients.operations, projectId, zone, operation.latestResponse.name!);
    } catch (ex: unknown) {
      if (!isNotFound(ex)) {
        throw ex;
      }
    }
  }

  async status(id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { projectId, zone } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    const instance = await getInstance(clients.instances, projectId, zone, name);

    let failure: string | undefined = undefined;
    if (!instance) {
      failure = 'Instance not found';
    } else if (instance.status !== 'RUNNING') {
      failure = `Instance does not have running status, got ${instance.status}`;
    } else if (!externalIp(instance)) {
      failure = 'Instance does not have an external IP address yet';
    }

    return {
      workloads: [
        {
          name: 'Default',
          nodes: [
            {
              name: 'Virtual Machine',
              isReady: !failure,
              message: failure,
            },
          ],
        },
      ],
    };
  }

  async metrics(id: string, request: ResourceRequest<Parameters, ResourceContext>): Promise<ResourceMetricsResult> {
    const { projectId, zone, sshUser } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    const instance = await getInstance(clients.instances, projectId, zone, name);
    const host = externalIp(instance);
    if (!host) {
      throw new Error(`Instance ${name} not found or has no external IP address yet`);
    }

    const ssh = new NodeSSH();
    await ssh.connect({ host, username: sshUser, password: request.resourceContext.password });

    try {
      return { metrics: await collectVmMetrics(ssh) };
    } finally {
      ssh.dispose();
    }
  }
}

interface GcpClients {
  instances: InstancesClient;
  operations: ZoneOperationsClient;
}

function createClients(parameters: Parameters): GcpClients {
  const { credentialsJson, projectId } = parameters;

  const options = { projectId, credentials: JSON.parse(credentialsJson) };

  return {
    instances: new InstancesClient(options),
    operations: new ZoneOperationsClient(options),
  };
}

async function getInstance(instances: InstancesClient, project: string, zone: string, name: string): Promise<Instance | null> {
  try {
    const [instance] = await instances.get({ project, zone, instance: name });
    return instance;
  } catch (ex: unknown) {
    if (isNotFound(ex)) {
      return null;
    }
    throw ex;
  }
}

function externalIp(instance: Instance | null): string | null {
  return instance?.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP ?? null;
}

async function waitForOperation(operations: ZoneOperationsClient, project: string, zone: string, operationName: string) {
  while (true) {
    const [operation] = await operations.wait({ project, zone, operation: operationName });
    if (operation.status === 'DONE') {
      return;
    }
  }
}

function isNotFound(ex: unknown): boolean {
  return (ex as { code?: number })?.code === GRPC_NOT_FOUND;
}

// Compute Engine names must be lowercase, start with a letter and only contain letters, digits and hyphens.
function sanitizeName(id: string) {
  const cleaned = id
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^[^a-z]+/, '')
    .replace(/-+$/, '')
    .slice(0, 40)
    .replace(/-+$/, '');

  return `vm-${cleaned}`;
}
