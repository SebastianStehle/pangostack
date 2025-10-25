import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';
import { WorkflowConfig } from '../config';

@Injectable()
export class TemporalService {
  private readonly connection: Promise<NativeConnection>;
  private readonly client: Promise<Client> = (async () => {
    return new Client({ connection: await this.connection });
  })();

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<WorkflowConfig>('workflow.temporal');

    this.connection = this.createConnection(config.temporal);
  }

  public async getClient(): Promise<[NativeConnection, Client]> {
    return [await this.connection, await this.client];
  }

  private async createConnection(config: { address?: string; apiKey?: string }): Promise<NativeConnection> {
    return NativeConnection.connect(config);
  }
}
