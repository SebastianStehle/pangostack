import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity, UserEntity } from '../database';
import { TeamEventListener } from './listeners/team-event.listener';
import { NotificationsService, NotificationsSyncService } from './services';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([TeamEntity, UserEntity])],
  providers: [NotificationsService, NotificationsSyncService, TeamEventListener],
  exports: [NotificationsService],
})
export class NotificationModule {}
