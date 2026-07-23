import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkerEntity, WorkerRepository } from 'src/domain/database';

export class DeleteWorker {
  constructor(public readonly workerId: number) {}
}

@CommandHandler(DeleteWorker)
export class DeleteWorkerHandler implements ICommandHandler<DeleteWorker, any> {
  constructor(
    @InjectRepository(WorkerEntity)
    private readonly workers: WorkerRepository,
  ) {}

  async execute(command: DeleteWorker): Promise<any> {
    const { workerId } = command;

    const { affected } = await this.workers.delete({ id: workerId });
    if (!affected) {
      throw new NotFoundException(`Worker ${workerId} not found.`);
    }
  }
}
