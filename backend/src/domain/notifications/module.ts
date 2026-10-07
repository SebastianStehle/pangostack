import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibModule } from 'src/lib';
import { DeploymentEntity, TeamEntity, UserEntity } from '../database';
import { BillingEventListener } from './listeners/billing-event.listener';
import { DeploymentEventListener } from './listeners/deployment-event.listener';
import { TeamEventListener } from './listeners/team-event.listener';
import { NotificationsService, NotificationsSyncService } from './services';

@Module({
  imports: [ConfigModule, LibModule, TypeOrmModule.forFeature([DeploymentEntity, TeamEntity, UserEntity])],
  providers: [BillingEventListener, DeploymentEventListener, NotificationsService, NotificationsSyncService, TeamEventListener],
  exports: [NotificationsService],
})
export class NotificationModule {}
