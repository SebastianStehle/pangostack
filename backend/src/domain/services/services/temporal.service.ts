import { Injectable } from '@nestjs/common';
import { Client } from '@temporalio/client';

@Injectable()
export class TemporalService {
  readonly client: Client;

  constructor() {
    this.client = new Client();
  }
}
