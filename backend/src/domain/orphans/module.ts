import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrphanedResourceEntity } from 'src/domain/database';
import { GetOrphanedResourcesHandler, SetOrphanedResourceStatusHandler } from './use-cases';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([OrphanedResourceEntity])],
  providers: [GetOrphanedResourcesHandler, SetOrphanedResourceStatusHandler],
})
export class OrphansModule {}
