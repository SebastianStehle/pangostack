import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { TestProject } from 'vitest/node';
import AppDataSource from 'src/domain/database/data-source';
import { runAdminStatement, withDatabase } from './database';

const POSTGRES_IMAGE = 'postgres:16-alpine';
const TEMPLATE_DB = 'pango_template';

let container: StartedPostgreSqlContainer;

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

  project.provide('dbAdminUrl', adminUrl);
  project.provide('dbTemplate', TEMPLATE_DB);
}

export async function teardown() {
  await container?.stop();
}
