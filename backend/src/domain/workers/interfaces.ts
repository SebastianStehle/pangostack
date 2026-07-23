export interface Worker {
  // The ID of the worker.
  id: number;

  // The endpoint of the worker.
  endpoint: string;

  // Indicates if an API key has been configured. The key itself is never exposed.
  hasApiKey: boolean;
}

export interface WorkerStatus {
  // Indicates if the worker can be reached.
  isReady: boolean;

  // The timestamp when the worker has been started.
  startedAt?: string | null;

  // The resource types that the worker provides.
  resourceTypes: string[];

  // The reason why the worker could not be reached.
  error?: string | null;
}

export type WorkerWithStatus = Worker & { status: WorkerStatus };
