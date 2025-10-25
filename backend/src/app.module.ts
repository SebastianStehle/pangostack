import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { DataSource } from 'typeorm';
import { AuthController } from './controllers/auth/auth.controller';
import { TeamBillingController } from './controllers/billing/team-billing.controller';
import { BlobsController } from './controllers/blobs/blobs.controller';
import { FaviconController } from './controllers/blobs/favicon.controller';
import { DeploymentsController } from './controllers/deployments/deployments.controller';
import { ServiceDeploymentsController } from './controllers/deployments/service-deployments.controller';
import { TeamDeploymentsController } from './controllers/deployments/team-deployments.controller';
import { HealthController } from './controllers/health/health.controller';
import { ServicesController } from './controllers/services/services.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { TeamsController } from './controllers/users/teams.controller';
import { UserGroupsController } from './controllers/users/user-groups.controller';
import { UsersController } from './controllers/users/users.controller';
import { WorkersController } from './controllers/workers/workers.controller';
import { AUTH_CONFIG_SCHEMA, authConfig } from './domain/auth';
import { AuthModule } from './domain/auth/module';
import { BILLING_CONFIG_SCHEMA, billingConfig, BillingModule } from './domain/billing';
import {
  BilledDeploymentEntity,
  BlobEntity,
  CacheEntity,
  DB_CONFIG_SCHEMA,
  DbConfig,
  dbConfig,
  DeploymentCheckEntity,
  DeploymentEntity,
  DeploymentLogEntity,
  DeploymentUpdateEntity,
  DeploymentUsageEntity,
  ServiceEntity,
  ServiceVersionEntity,
  SessionEntity,
  SettingEntity,
  TeamEntity,
  TeamUserEntity,
  UserEntity,
  UserGroupEntity,
  WorkerEntity,
} from './domain/database';
import { AddDefinitionSource1760346848861, Init1760346162798, MigratorService } from './domain/database/migrations';
import { NOTIFICATION_CONFIG_SCHEMA, notificationConfig } from './domain/notifications';
import { NotificationModule } from './domain/notifications';
import { ServicesModule } from './domain/services';
import { SettingsModule } from './domain/settings';
import { UsersModule } from './domain/users/module';
import { WORKER_CONFIG_SCHEMA, workerConfig } from './domain/workers';
import { WorkersModule } from './domain/workers/module';
import { WORKFLOW_CONFIG_SCHEMA, workflowConfig, WorkflowModule } from './domain/workflows';
import { HealthModule } from './health';
import { LibModule, URLS_CONFIG_SCHEMA, urlsConfig } from './lib';

@Module({
  imports: [
    AuthModule,
    BillingModule,
    CacheModule.register({ isGlobal: true, shouldCloneBeforeSet: false }),
    ConfigModule.forRoot({
      load: [authConfig, billingConfig, dbConfig, notificationConfig, urlsConfig, workflowConfig, workerConfig],
      isGlobal: true,
      validationSchema: Joi.object({
        auth: AUTH_CONFIG_SCHEMA,
        billing: BILLING_CONFIG_SCHEMA,
        db: DB_CONFIG_SCHEMA,
        notification: NOTIFICATION_CONFIG_SCHEMA,
        urls: URLS_CONFIG_SCHEMA,
        workflow: WORKFLOW_CONFIG_SCHEMA,
        worker: WORKER_CONFIG_SCHEMA,
      }),
    }),
    CqrsModule,
    HealthModule,
    LibModule,
    NotificationModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'assets') }),
    ServicesModule,
    SettingsModule,
    TerminusModule.forRoot(),
    UsersModule,
    WorkersModule,
    WorkflowModule,
    TypeOrmModule.forFeature([TeamEntity, UserEntity]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.getOrThrow<DbConfig>('db');
        return {
          type: config.type || 'postgres',
          url: config.url,
          retryAttempts: 10,
          retryDelay: 100,
          entities: [
            BilledDeploymentEntity,
            BlobEntity,
            CacheEntity,
            DeploymentCheckEntity,
            DeploymentEntity,
            DeploymentLogEntity,
            DeploymentUpdateEntity,
            DeploymentUsageEntity,
            ServiceEntity,
            ServiceVersionEntity,
            SessionEntity,
            SettingEntity,
            TeamEntity,
            TeamUserEntity,
            UserEntity,
            UserGroupEntity,
            WorkerEntity,
          ],
          migrations: [Init1760346162798, AddDefinitionSource1760346848861],
        };
      },
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options!).initialize();
        return dataSource;
      },
    }),
  ],
  controllers: [
    AuthController,
    BlobsController,
    DeploymentsController,
    FaviconController,
    HealthController,
    ServiceDeploymentsController,
    ServicesController,
    SettingsController,
    TeamBillingController,
    TeamDeploymentsController,
    TeamsController,
    UserGroupsController,
    UsersController,
    WorkersController,
  ],
  providers: [MigratorService],
})
export class AppModule {}
