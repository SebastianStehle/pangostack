import { Injectable, Logger } from '@nestjs/common';
import { NodeSSH } from 'node-ssh';
import { composeDown, composeUp, getContainers, getLogs, pollUntil } from 'src/lib';
import { defineResource, Resource, ResourceApplyResult, ResourceLogResult, ResourceRequest, ResourceStatusResult } from '../interface';

type Parameters = { host: string; sshUser: string; sshPassword: string; dockerComposeUrl: string };

@Injectable()
export class DockerComposeSshResource implements Resource {
  private readonly logger = new Logger(DockerComposeSshResource.name);

  descriptor = defineResource<Parameters, {}>({
    name: 'docker-compose-ssh',
    description: 'Applies a docker compose file over SSH.',
    parameters: {
      host: {
        description: 'The host name of IP address of the target server.',
        type: 'string',
        required: true,
      },
      sshUser: {
        description: 'The SSH username.',
        type: 'string',
        required: true,
      },
      sshPassword: {
        description: 'The SSH password.',
        type: 'string',
        required: true,
      },
      dockerComposeUrl: {
        description: 'The URL of the docker compose file.',
        type: 'string',
        required: true,
      },
    },
    context: {},
  });

  async describe(): Promise<any> {
    return {};
  }

  async apply(id: string, request: ResourceRequest<Parameters>): Promise<ResourceApplyResult> {
    const { dockerComposeUrl, host, sshUser, sshPassword, ...others } = request.parameters;

    const logContext: any = { id, host };
    try {
      this.logger.log({ message: 'Waiting for SSH connection', context: logContext });

      const ssh = new NodeSSH();
      try {
        await pollUntil(request.timeoutMs, async () => {
          await ssh.connect({ host, username: sshUser, password: sshPassword });
          return true;
        });

        this.logger.log({ message: 'Instance accepted SSH connection, deploying docker', context: logContext });
        await composeUp(ssh, dockerComposeUrl, others, request.timeoutMs, (message) => {
          this.logger.log({ message, context: logContext });
        });
      } finally {
        ssh.dispose();
      }

      return {
        context: {},
        connection: {},
      };
    } catch (ex: any) {
      this.logger.error({ message: `Instance could not be deployed: ${ex.message}`, context: logContext });
      throw ex;
    }
  }

  async delete(_id: string, request: ResourceRequest<Parameters>) {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    await ssh.connect({ host, username: sshUser, password: sshPassword });

    await composeDown(ssh);
  }

  async log(_id: string, request: ResourceRequest<Parameters>): Promise<ResourceLogResult> {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    await ssh.connect({ host, username: sshUser, password: sshPassword });
    const logs = await getLogs(ssh);

    return { instances: logs.map((x) => ({ instanceId: x.name, messages: x.log })) };
  }

  async status(_id: string, request: ResourceRequest<Parameters>): Promise<ResourceStatusResult> {
    const { host, sshUser, sshPassword } = request.parameters;

    const ssh = new NodeSSH();
    await ssh.connect({ host, username: sshUser, password: sshPassword });

    const containers = await getContainers(ssh);

    const status: ResourceStatusResult = {
      workloads: [
        {
          name: 'Docker Compose',
          nodes: containers,
        },
      ],
    };

    return status;
  }
}
