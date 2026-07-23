import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { TestProject } from 'vitest/node';
import AppDataSource from 'src/domain/database/data-source';
import { runAdminStatement, withDatabase } from './database';

const POSTGRES_IMAGE = 'postgres:16-alpine';
const TEMPLATE_DB = 'pango_template';

// The worker resource types a reachable seeded worker advertises. Handlers only look at the names,
// so a single type is enough to make a worker count as available.
const WORKER_RESOURCE_TYPES = [{ name: 'test-resource', description: 'Test resource', parameters: {}, context: {}, metrics: {} }];

let container: StartedPostgreSqlContainer;
let worker: Server;

// A stateless stand-in for a real worker, so tests can register a reachable worker without spinning
// up the actual microservice. It only answers the resource-types endpoint used during resolution.
function startFakeWorker() {
  const server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ items: WORKER_RESOURCE_TYPES }));
  });

  return new Promise<Server>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// Runs once for the whole integration run, in the main process, before any test file. A single
// container is started here and migrated into a template database; each test file then clones that
// template into its own database (see harness), which keeps files isolated so they can run in
// parallel while still sharing this one container.
export async function setup(project: TestProject) {
  container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();

  const adminUrl = container.getConnectionUri();

  await runAdminStatement(adminUrl, `CREATE DATABASE "${TEMPLATE_DB}"`);

  // Apply the real migrations once against the template, so clones start migrated and the migrations
  // get exercised on each run for free.
  AppDataSource.setOptions({ url: withDatabase(adminUrl, TEMPLATE_DB) });
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();

  worker = await startFakeWorker();
  const { port } = worker.address() as AddressInfo;

  project.provide('dbAdminUrl', adminUrl);
  project.provide('dbTemplate', TEMPLATE_DB);
  project.provide('workerUrl', `http://127.0.0.1:${port}`);
}

export async function teardown() {
  await container?.stop();
  worker?.close();
}
