import { ComputeManagementClient } from '@azure/arm-compute';
import { NetworkManagementClient } from '@azure/arm-network';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ClientSecretCredential } from '@azure/identity';
import { Injectable } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { collectVmMetrics, generatePassword, pollUntil } from 'src/lib';
import { defineResource, Resource, ResourceMetricsResult, ResourceReporter, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  subscriptionId: string;
  resourceGroup: string;
  location: string;
  vmSize: string;
  adminUser: string;
  image: string;
};

type Context = { host: string; sshUser: string; sshPassword: string };

type ResourceContext = { password: string };

const VNET_ADDRESS_PREFIX = '10.0.0.0/16';
const SUBNET_ADDRESS_PREFIX = '10.0.0.0/24';
const SSH_RULE_PRIORITY = 1000;
const AZURE_NOT_FOUND_STATUS = 404;

@Injectable()
export class AzureVmResource implements Resource {
  descriptor = defineResource<Parameters, Context>({
    name: 'azure-vm',
    description: 'Creates an Azure virtual machine including its network resources.',
    parameters: {
      tenantId: {
        description: 'The Azure Active Directory tenant id.',
        type: 'string',
        required: true,
      },
      clientId: {
        description: 'The service principal client id.',
        type: 'string',
        required: true,
      },
      clientSecret: {
        description: 'The service principal client secret.',
        type: 'string',
        required: true,
      },
      subscriptionId: {
        description: 'The Azure subscription id.',
        type: 'string',
        required: true,
      },
      resourceGroup: {
        description: 'The resource group. It is created when it does not exist.',
        type: 'string',
        required: true,
      },
      location: {
        description: 'The Azure region, for example westeurope.',
        type: 'string',
        required: true,
      },
      vmSize: {
        description: 'The size of the virtual machine, for example Standard_B1s.',
        type: 'string',
        required: true,
      },
      adminUser: {
        description: 'The name of the admin user.',
        type: 'string',
        required: true,
      },
      image: {
        description: 'The image URN in the form publisher:offer:sku:version.',
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
    const { resourceGroup, location, adminUser } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    reporter.beginStep('Ensuring resource group');
    await clients.resources.resourceGroups.createOrUpdate(resourceGroup, { location });

    const existing = await getVm(clients.compute, resourceGroup, name);
    if (!existing) {
      const password = generatePassword();
      request.resourceContext.password = password;

      // Persist the password before the (long) provisioning, so a retry can reuse this VM instead of orphaning it.
      reporter.appendResourceContext(request.resourceContext);

      await this.createInfrastructure(clients, request.parameters, name, password, reporter);
    }

    reporter.beginStep('Reading public IP address');
    const host = await getPublicIp(clients.network, resourceGroup, publicIpName(name));
    if (!host) {
      throw new Error(`Virtual machine ${name} does not have a public IP address.`);
    }

    const ssh = new NodeSSH();
    reporter.beginStep('Waiting for SSH connection');
    await pollUntil(request.timeoutMs, async () => {
      await ssh.connect({ host, username: adminUser, password: request.resourceContext.password });
      return true;
    });
    ssh.dispose();

    reporter.appendContext({
      host,
      sshUser: adminUser,
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

  private async createInfrastructure(
    clients: AzureClients,
    parameters: Parameters,
    name: string,
    password: string,
    reporter: ResourceReporter,
  ) {
    const { resourceGroup, location, vmSize, adminUser, image } = parameters;

    reporter.beginStep('Creating network');
    const securityGroup = await clients.network.networkSecurityGroups.createOrUpdate(resourceGroup, nsgName(name), {
      location,
      securityRules: [
        {
          name: 'allow-ssh',
          protocol: 'Tcp',
          access: 'Allow',
          direction: 'Inbound',
          priority: SSH_RULE_PRIORITY,
          sourceAddressPrefix: '*',
          sourcePortRange: '*',
          destinationAddressPrefix: '*',
          destinationPortRange: '22',
        },
      ],
    });

    const vnet = await clients.network.virtualNetworks.createOrUpdate(resourceGroup, vnetName(name), {
      location,
      addressSpace: { addressPrefixes: [VNET_ADDRESS_PREFIX] },
      subnets: [{ name: 'default', addressPrefix: SUBNET_ADDRESS_PREFIX }],
    });

    const publicIp = await clients.network.publicIPAddresses.createOrUpdate(resourceGroup, publicIpName(name), {
      location,
      publicIPAllocationMethod: 'Static',
      sku: { name: 'Standard' },
    });

    const nic = await clients.network.networkInterfaces.createOrUpdate(resourceGroup, nicName(name), {
      location,
      networkSecurityGroup: { id: securityGroup.id },
      ipConfigurations: [
        {
          name: 'ipconfig1',
          subnet: { id: vnet.subnets![0].id },
          publicIPAddress: { id: publicIp.id },
        },
      ],
    });

    reporter.beginStep('Creating virtual machine');
    const [publisher, offer, sku, version] = image.split(':');
    await clients.compute.virtualMachines.createOrUpdate(resourceGroup, name, {
      location,
      hardwareProfile: { vmSize },
      storageProfile: { imageReference: { publisher, offer, sku, version: version || 'latest' } },
      osProfile: {
        computerName: name,
        adminUsername: adminUser,
        adminPassword: password,
      },
      networkProfile: { networkInterfaces: [{ id: nic.id, primary: true }] },
    });
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const { resourceGroup } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    // The virtual machine must go first, because the network resources it references cannot be deleted while in use.
    await ignoreNotFound(() => clients.compute.virtualMachines.delete(resourceGroup, name));
    await ignoreNotFound(() => clients.network.networkInterfaces.delete(resourceGroup, nicName(name)));
    await ignoreNotFound(() => clients.network.publicIPAddresses.delete(resourceGroup, publicIpName(name)));
    await ignoreNotFound(() => clients.network.virtualNetworks.delete(resourceGroup, vnetName(name)));
    await ignoreNotFound(() => clients.network.networkSecurityGroups.delete(resourceGroup, nsgName(name)));
  }

  async status(id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { resourceGroup } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    const vm = await getVm(clients.compute, resourceGroup, name);

    let failure: string | undefined = undefined;
    if (!vm) {
      failure = 'Virtual machine not found';
    } else {
      const instance = await clients.compute.virtualMachines.instanceView(resourceGroup, name);
      const powerState = instance.statuses?.find((s) => s.code?.startsWith('PowerState/'))?.code;
      if (powerState !== 'PowerState/running') {
        failure = `Virtual machine is not running, got ${powerState ?? 'unknown'}`;
      }
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
    const { resourceGroup, adminUser } = request.parameters;

    const clients = createClients(request.parameters);
    const name = sanitizeName(id);

    const host = await getPublicIp(clients.network, resourceGroup, publicIpName(name));
    if (!host) {
      throw new Error(`Virtual machine ${name} not found or has no public IP address yet`);
    }

    const ssh = new NodeSSH();
    await ssh.connect({ host, username: adminUser, password: request.resourceContext.password });

    try {
      return { metrics: await collectVmMetrics(ssh) };
    } finally {
      ssh.dispose();
    }
  }
}

interface AzureClients {
  compute: ComputeManagementClient;
  network: NetworkManagementClient;
  resources: ResourceManagementClient;
}

function createClients(parameters: Parameters): AzureClients {
  const { tenantId, clientId, clientSecret, subscriptionId } = parameters;

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  return {
    compute: new ComputeManagementClient(credential, subscriptionId),
    network: new NetworkManagementClient(credential, subscriptionId),
    resources: new ResourceManagementClient(credential, subscriptionId),
  };
}

async function getVm(compute: ComputeManagementClient, resourceGroup: string, name: string) {
  try {
    return await compute.virtualMachines.get(resourceGroup, name);
  } catch (ex: unknown) {
    if (isNotFound(ex)) {
      return null;
    }
    throw ex;
  }
}

async function getPublicIp(network: NetworkManagementClient, resourceGroup: string, name: string) {
  try {
    const publicIp = await network.publicIPAddresses.get(resourceGroup, name);
    return publicIp.ipAddress ?? null;
  } catch (ex: unknown) {
    if (isNotFound(ex)) {
      return null;
    }
    throw ex;
  }
}

async function ignoreNotFound(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (ex: unknown) {
    if (!isNotFound(ex)) {
      throw ex;
    }
  }
}

function isNotFound(ex: unknown): boolean {
  const status = (ex as { statusCode?: number })?.statusCode;
  const code = (ex as { code?: string })?.code;

  return status === AZURE_NOT_FOUND_STATUS || code === 'ResourceNotFound' || code === 'NotFound';
}

// Azure resource names allow letters, digits, hyphens, underscores and periods. The names must not end
// with a period, so trailing separators are trimmed.
function sanitizeName(id: string) {
  const cleaned = id
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .slice(0, 40)
    .replace(/-+$/, '');

  return `vm-${cleaned}`;
}

function nicName(name: string) {
  return `${name}-nic`;
}

function publicIpName(name: string) {
  return `${name}-ip`;
}

function vnetName(name: string) {
  return `${name}-vnet`;
}

function nsgName(name: string) {
  return `${name}-nsg`;
}
