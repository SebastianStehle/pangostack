import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';
import { WorkflowConfig } from '../config';

@Injectable()
export class TemporalService {
  private readonly logger = new Logger(TemporalService.name);
  private readonly client: Promise<[NativeConnection, Client]>;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<WorkflowConfig>('workflow.temporal').temporal;

    this.client = this.createClient(config);
  }

  public async getClient(): Promise<[NativeConnection, Client]> {
    return this.client;
  }

  private async createClient(config: WorkflowConfig['temporal']): Promise<[NativeConnection, Client]> {
    config ||= {};
    if (config.address) {
      this.logger.log(`Connecting to temporal with custom address: ${config.address}`);
    } else {
      this.logger.log(`Connecting to temporal with default address`);
    }

    const connection = await NativeConnection.connect(config);

    return [connection, new Client({ connection })];
  }
}
