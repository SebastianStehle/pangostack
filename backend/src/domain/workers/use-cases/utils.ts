import { WorkerEntity } from 'src/domain/database';
import { WorkerClient, WorkerError } from '../client';
import { Worker, WorkerStatus } from './../interfaces';

// A worker that accepts the connection but never answers would otherwise block the caller forever,
// which also stalls the health check.
const PING_TIMEOUT_MS = 5000;

export function buildWorker(source: WorkerEntity): Worker {
  const { apiKey, endpoint, id } = source;

  return { id, endpoint, hasApiKey: !!apiKey };
}

export async function pingWorker(source: WorkerEntity): Promise<WorkerStatus> {
  const client = new WorkerClient(source.endpoint, source.apiKey);

  try {
    const { resourceTypes, startedAt } = await client.ping.getPing({ signal: AbortSignal.timeout(PING_TIMEOUT_MS) });

    return { isReady: true, resourceTypes, startedAt };
  } catch (ex) {
    const error = ex instanceof WorkerError ? ex.message : String(ex);

    return { isReady: false, resourceTypes: [], error };
  }
}
