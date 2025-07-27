import { Client } from '@temporalio/client';

export class TemporalService {
  readonly client: Client;

  constructor() {
    this.client = new Client();
  }
}
