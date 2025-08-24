export interface Worker {
  // The endpoint of the worker.
  endpoint: string;

  // Indicates if the worker can be reached.
  isReady: boolean;
}
