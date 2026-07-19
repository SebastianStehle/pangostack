import { randomUUID } from 'crypto';
import { INestApplication, ModuleMetadata } from '@nestjs/common';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { inject } from 'vitest';
import AppDataSource from 'src/domain/database/data-source';
import { runAdminStatement, withDatabase } from './database';

export interface IntegrationTestContext {
  app: INestApplication;
  dataSource: DataSource;
  commandBus: CommandBus;
  queryBus: QueryBus;
  close(): Promise<void>;
}

// Boots a real NestJS module graph wired to a database of its own, cloned from the migrated template
// in the shared container. Real TypeORM repositories and real CQRS handlers are used; the caller
// mocks only the outward-facing collaborators it passes in. CqrsModule and the buses are wired in
// here so every handler test does not repeat that setup. Because each call gets a private database,
// test files stay isolated and can run in parallel without a container per test.
export async function createIntegrationTest(
  metadata: ModuleMetadata,
  configure?: (builder: TestingModuleBuilder) => TestingModuleBuilder,
): Promise<IntegrationTestContext> {
  const adminUrl = inject('dbAdminUrl');
  const database = `pango_test_${randomUUID().replace(/-/g, '')}`;

  await runAdminStatement(adminUrl, `CREATE DATABASE "${database}" TEMPLATE "${inject('dbTemplate')}"`);

  const options = AppDataSource.options as PostgresConnectionOptions;

  let builder = Test.createTestingModule({
    ...metadata,
    imports: [
      CqrsModule,
      TypeOrmModule.forRoot({
        ...options,
        url: withDatabase(adminUrl, database),
        synchronize: false,
        migrationsRun: false,
        retryAttempts: 0,
      }),
      ...(metadata.imports ?? []),
    ],
  });

  if (configure) {
    builder = configure(builder);
  }

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  await app.init();

  const close = async () => {
    await app.close();
    await runAdminStatement(adminUrl, `DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
  };

  return {
    app,
    dataSource: app.get(DataSource),
    commandBus: app.get(CommandBus),
    queryBus: app.get(QueryBus),
    close,
  };
}
