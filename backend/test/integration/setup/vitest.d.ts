// Connection details for the single shared container are handed from the global setup to every test
// worker via Vitest's typed provide/inject channel.
declare module 'vitest' {
  interface ProvidedContext {
    // Admin connection URL used to create/drop each file's private database.
    dbAdminUrl: string;
    // Name of the migrated template database that per-file databases are cloned from.
    dbTemplate: string;
    // Base URL of the shared fake worker that reachable seeded workers point at.
    workerUrl: string;
  }
}

export {};
