import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';
import { saveAndFind } from 'src/lib';
import { Worker } from '../interfaces';
import { buildWorker } from './utils';

type Values = Pick<Worker, 'endpoint'> & { apiKey?: string };

export class CreateWorker extends Command<CreateWorkerResult> {
  constructor(public readonly values: Values) {
    super();
  }
}

export class CreateWorkerResult {
  constructor(public readonly worker: Worker) {}
}

@CommandHandler(CreateWorker)
export class CreateWorkerHandler implements ICommandHandler<CreateWorker, CreateWorkerResult> {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(request: CreateWorker): Promise<CreateWorkerResult> {
    const { apiKey, endpoint } = request.values;

    const worker = await saveAndFind(this.workers, { apiKey, endpoint });

    return new CreateWorkerResult(buildWorker(worker));
  }
}
