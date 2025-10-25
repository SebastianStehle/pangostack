import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { WorkerConfig } from '../config';

@Injectable()
export class WorkerInitializerService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    let worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (worker) {
      return;
    }

    const endpoint = this.configService.get<WorkerConfig>('worker')?.endpoint || 'http://localhost:3000';

    worker = this.workers.create({ endpoint });
    await this.workers.save(worker);
  }
}
