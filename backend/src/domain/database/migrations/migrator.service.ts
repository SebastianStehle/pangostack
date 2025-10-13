import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class MigratorService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigratorService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (this.dataSource.options.type !== 'postgres') {
      this.logger.log('Not running with postgres, using normal migration process');
      await this.dataSource.runMigrations();
      return;
    }

    const tables: { table_name: string }[] = await this.dataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE 
        table_schema = 'public' AND 
        table_type = 'BASE TABLE'AND 
        table_name != 'migrations';
    `);

    if (tables.length > 0) {
      this.logger.log('Found existing tables. Inserting Init script to migrations.');
      const MIGRATION_NAME = 'Init1760346162798';
      const MIGRATION_TIME = 1760346162798;

      await this.dataSource.query(
        `
        INSERT INTO migrations ("timestamp", "name")
        SELECT $1, $2
        WHERE NOT EXISTS (
          SELECT 1 FROM migrations WHERE "timestamp" = $1
        );
      `,
        [MIGRATION_TIME, MIGRATION_NAME],
      );
    }

    await this.dataSource.runMigrations();
  }
}
