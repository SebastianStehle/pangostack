import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not } from 'typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { Activity } from '../registration';

export type GetWorkerParam = object;

export type GetWorkerResult = { workerApiKey?: string; workerEndpoint: string };

@Activity(getWorker)
export class GetWorkerActivity implements Activity<GetWorkerParam, GetWorkerResult> {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute() {
    const worker = await this.workers.findOne({ where: { endpoint: Not(IsNull()) } });
    if (!worker) {
      throw new NotFoundException('No worker registered.');
    }

    return { workerApiKey: worker.apiKey, workerEndpoint: worker.endpoint };
  }
}

export async function getWorker(param: GetWorkerParam): Promise<GetWorkerResult> {
  return param as any;
}
