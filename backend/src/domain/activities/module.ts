import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamActivityEntity } from 'src/domain/database';
import { ActivityListener } from './listeners/activity.listener';
import { GetTeamActivitiesHandler } from './use-cases';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([TeamActivityEntity])],
  providers: [ActivityListener, GetTeamActivitiesHandler],
})
export class ActivitiesModule {}
