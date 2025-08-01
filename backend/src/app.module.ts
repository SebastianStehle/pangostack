import { join } from 'path';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthController } from './controllers/auth/auth.controller';
import { TeamBillingController } from './controllers/billing/team-billing.controller';
import { BlobsController } from './controllers/blobs/blobs.controller';
import { TeamDeploymentsController } from './controllers/deployments/team-deployments.controller';
import { ServicesController } from './controllers/services/services.controller';
import { SettingsController } from './controllers/settings/settings.controller';
import { TeamsController } from './controllers/users/teams.controller';
import { UserGroupsController } from './controllers/users/user-groups.controller';
import { UsersController } from './controllers/users/users.controller';
import { AuthModule } from './domain/auth/module';
import { billingConfig, BillingModule } from './domain/billing';
import {
  BlobEntity,
  CacheEntity,
  DeploymentEntity,
  DeploymentLogEntity,
  DeploymentUpdateEntity,
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
import { ServicesModule } from './domain/services';
import { SettingsModule } from './domain/settings';
import { UsersModule } from './domain/users/module';

@Module({
  imports: [
    AuthModule,
    BillingModule,
    CacheModule.register({ isGlobal: true, shouldCloneBeforeSet: false }),
    ConfigModule.forRoot({ load: [billingConfig] }),
    CqrsModule,
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'assets') }),
    ServicesModule,
    SettingsModule,
    UsersModule,
    TypeOrmModule.forFeature([TeamEntity, UserEntity]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.getOrThrow('DB_URL'),
        type: config.get('DB_TYPE') || 'postgres',
        retryAttempts: 10,
        retryDelay: 100,
        entities: [
          BlobEntity,
          CacheEntity,
          DeploymentEntity,
          DeploymentLogEntity,
          DeploymentUpdateEntity,
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
        synchronize: true,
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
  controllers: [
    AuthController,
    BlobsController,
    ServicesController,
    SettingsController,
    TeamBillingController,
    TeamDeploymentsController,
    TeamsController,
    UserGroupsController,
    UsersController,
  ],
})
export class AppModule {}
