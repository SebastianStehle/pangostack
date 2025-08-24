import { WorkerEntity } from 'src/domain/database';
import { Worker } from './../interfaces';

export function buildWorker(source: WorkerEntity, isReady: boolean): Worker {
  const { endpoint } = source;

  return { endpoint, isReady };
}
