import {
  _InstanceType,
  DescribeInstancesCommand,
  EC2Client,
  Instance,
  RunInstancesCommand,
  TerminateInstancesCommand,
} from '@aws-sdk/client-ec2';
import { Injectable } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { buildPasswordCloudInit, collectVmMetrics, generatePassword, pollUntil } from 'src/lib';
import { defineResource, Resource, ResourceMetricsResult, ResourceReporter, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  imageId: string;
  instanceType: string;
  sshUser: string;
  subnetId?: string;
  securityGroupId?: string;
};

type Context = { host: string; sshUser: string; sshPassword: string };

type ResourceContext = { password: string };

// States in which an instance still counts as existing for the deployment. Terminated instances are
// ignored so a fresh apply can recreate them.
const ACTIVE_STATES = ['pending', 'running', 'stopping', 'stopped'];

@Injectable()
export class AwsVmResource implements Resource {
  descriptor = defineResource<Parameters, Context>({
    name: 'aws-vm',
    description: 'Creates an AWS EC2 virtual machine.',
    parameters: {
      accessKeyId: {
        description: 'The AWS access key id.',
        type: 'string',
        required: true,
      },
      secretAccessKey: {
        description: 'The AWS secret access key.',
        type: 'string',
        required: true,
      },
      region: {
        description: 'The AWS region, for example eu-central-1.',
        type: 'string',
        required: true,
      },
      imageId: {
        description: 'The id of the AMI to launch, for example ami-12345678.',
        type: 'string',
        required: true,
      },
      instanceType: {
        description: 'The instance type, for example t3.small.',
        type: 'string',
        required: true,
      },
      sshUser: {
        description: 'The SSH user of the image, for example ubuntu or ec2-user.',
        type: 'string',
        required: true,
      },
      subnetId: {
        description: 'The optional subnet to launch the instance in.',
        type: 'string',
        required: false,
      },
      securityGroupId: {
        description: 'The optional security group. It must allow inbound SSH.',
        type: 'string',
        required: false,
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
    const { sshUser } = request.parameters;

    const client = createClient(request.parameters);

    reporter.beginStep('Creating instance');

    let instance = await findInstance(client, id);
    if (!instance) {
      const password = generatePassword();
      request.resourceContext.password = password;

      // Persist the password before the (long) wait, so a retry can reuse this instance instead of orphaning it.
      reporter.appendResourceContext(request.resourceContext);

      instance = await this.createInstance(client, id, request, password);
    }

    reporter.beginStep('Waiting for instance to become ready');
    instance = await waitForInstance(client, instance.InstanceId!, request.timeoutMs);

    const host = instance.PublicIpAddress!;

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

  private async createInstance(client: EC2Client, id: string, request: ResourceRequest<Parameters>, password: string) {
    const { imageId, instanceType, sshUser, subnetId, securityGroupId } = request.parameters;

    const response = await client.send(
      new RunInstancesCommand({
        ImageId: imageId,
        InstanceType: instanceType as _InstanceType,
        MinCount: 1,
        MaxCount: 1,
        SubnetId: subnetId,
        SecurityGroupIds: securityGroupId ? [securityGroupId] : undefined,
        UserData: Buffer.from(buildPasswordCloudInit(sshUser, password)).toString('base64'),
        TagSpecifications: [{ ResourceType: 'instance', Tags: [{ Key: 'Name', Value: id }] }],
      }),
    );

    return response.Instances![0];
  }

  async delete(id: string, request: ResourceRequest<Parameters>) {
    const client = createClient(request.parameters);

    const instance = await findInstance(client, id);
    if (!instance) {
      return;
    }

    await client.send(new TerminateInstancesCommand({ InstanceIds: [instance.InstanceId!] }));
  }

  async status(id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const client = createClient(request.parameters);

    const instance = await findInstance(client, id);

    let failure: string | undefined = undefined;
    if (!instance) {
      failure = 'Instance not found';
    } else if (instance.State?.Name !== 'running') {
      failure = `Instance does not have running status, got ${instance.State?.Name}`;
    } else if (!instance.PublicIpAddress) {
      failure = 'Instance does not have a public IP address yet';
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
    const { sshUser } = request.parameters;

    const client = createClient(request.parameters);
    const instance = await findInstance(client, id);
    if (!instance || !instance.PublicIpAddress) {
      throw new Error(`Instance ${id} not found or has no public IP address yet`);
    }

    const ssh = new NodeSSH();
    await ssh.connect({ host: instance.PublicIpAddress, username: sshUser, password: request.resourceContext.password });

    try {
      return { metrics: await collectVmMetrics(ssh) };
    } finally {
      ssh.dispose();
    }
  }
}

function createClient(parameters: Parameters) {
  const { accessKeyId, secretAccessKey, region } = parameters;

  return new EC2Client({ region, credentials: { accessKeyId, secretAccessKey } });
}

async function waitForInstance(client: EC2Client, instanceId: string, timeout: number): Promise<Instance> {
  await pollUntil(timeout, async () => {
    const instance = await getInstance(client, instanceId);

    return !!instance && instance.State?.Name === 'running' && !!instance.PublicIpAddress;
  });

  return (await getInstance(client, instanceId))!;
}

async function getInstance(client: EC2Client, instanceId: string): Promise<Instance | null> {
  const response = await client.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));

  return response.Reservations?.[0]?.Instances?.[0] ?? null;
}

async function findInstance(client: EC2Client, id: string): Promise<Instance | null> {
  const response = await client.send(
    new DescribeInstancesCommand({
      Filters: [
        { Name: 'tag:Name', Values: [id] },
        { Name: 'instance-state-name', Values: ACTIVE_STATES },
      ],
    }),
  );

  for (const reservation of response.Reservations ?? []) {
    for (const instance of reservation.Instances ?? []) {
      return instance;
    }
  }

  return null;
}
