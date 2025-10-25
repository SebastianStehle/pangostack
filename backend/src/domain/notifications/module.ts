import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamEntity, UserEntity } from '../database';
import { NotificationsService, NotificationsSyncService } from './services';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([TeamEntity, UserEntity])],
  providers: [NotificationsService, NotificationsSyncService],
  exports: [NotificationsService],
})
export class NotificationModule {}
