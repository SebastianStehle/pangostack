import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';

@Injectable()
export class TemporalService {
  private readonly connection: Promise<NativeConnection>;
  private readonly client: Promise<Client>;

  constructor(configService: ConfigService) {
    this.connection = this.createConnection({
      address: configService.get('TEMPORAL_ADDRESS'),
      apiKey: configService.get('TEMPORAL_APIKEY'),
    });

    this.client = this.createClient();
  }

  public async getClient(): Promise<[NativeConnection, Client]> {
    return [await this.connection, await this.client];
  }

  private async createConnection(config: { address?: string; apiKey?: string }): Promise<NativeConnection> {
    return NativeConnection.connect(config);
  }

  private async createClient(): Promise<Client> {
    return new Client({ connection: await this.connection });
  }
}
