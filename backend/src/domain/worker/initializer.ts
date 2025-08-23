import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';

@Injectable()
export class WorkerInitializer implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async onApplicationBootstrap() {
    let worker = await this.workers.findOne({});
    if (worker) {
      return;
    }

    worker = this.workers.create({ endpoint: 'http://localhost:3000' });
    await this.workers.save(worker);
  }
}
