import { Injectable } from '@nestjs/common';
import { Client } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';

@Injectable()
export class TemporalService {
  private readonly connection = this.createConnection();
  private readonly client = this.createClient();

  public async getClient(): Promise<[NativeConnection, Client]> {
    return [await this.connection, await this.client];
  }

  private async createConnection(): Promise<NativeConnection> {
    return NativeConnection.connect();
  }

  private async createClient(): Promise<Client> {
    return new Client({ connection: await this.connection });
  }
}
