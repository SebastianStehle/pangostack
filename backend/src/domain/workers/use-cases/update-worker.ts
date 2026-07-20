import { NotFoundException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { assignDefined } from 'src/lib';
import { Worker } from '../interfaces';
import { buildWorker } from './utils';

type Values = Partial<Pick<Worker, 'endpoint'> & { apiKey?: string }>;

export class UpdateWorker extends Command<UpdateWorkerResult> {
  constructor(
    public readonly workerId: number,
    public readonly values: Values,
  ) {
    super();
  }
}

export class UpdateWorkerResult {
  constructor(public readonly worker: Worker) {}
}

@CommandHandler(UpdateWorker)
export class UpdateWorkerHandler implements ICommandHandler<UpdateWorker, UpdateWorkerResult> {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(request: UpdateWorker): Promise<UpdateWorkerResult> {
    const { values, workerId } = request;
    const { apiKey, endpoint } = values;

    const worker = await this.workers.findOneBy({ id: workerId });
    if (!worker) {
      throw new NotFoundException(`Worker ${workerId} not found.`);
    }

    // Assign the object manually to avoid updating unexpected values. An undefined API key keeps the
    // existing key, because it is never sent back to the client.
    assignDefined(worker, { apiKey, endpoint });
    await this.workers.save(worker);

    return new UpdateWorkerResult(buildWorker(worker));
  }
}
