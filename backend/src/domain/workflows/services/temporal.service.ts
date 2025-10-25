import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';
import { WorkflowConfig } from '../config';

@Injectable()
export class TemporalService {
  private readonly logger = new Logger(TemporalService.name);
  private readonly connection: Promise<NativeConnection>;
  private readonly client: Promise<Client>;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<WorkflowConfig>('workflow.temporal').temporal || {};

    if (config.address) {
      this.logger.log(`Connecting to temporal with custom address: ${config.address}`);
    } else {
      this.logger.log(`Connecting to temporal with default address`);
    }

    this.connection = this.createConnection(config);
    this.client = this.createClient();
  }

  public async getClient(): Promise<[NativeConnection, Client]> {
    return [await this.connection, await this.client];
  }

  private async createClient(): Promise<Client> {
    return new Client({ connection: await this.connection });
  }

  private async createConnection(config: { address?: string; apiKey?: string }): Promise<NativeConnection> {
    return NativeConnection.connect(config);
  }
}
