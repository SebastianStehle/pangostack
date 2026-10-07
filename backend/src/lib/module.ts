import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ResourceUniqueIdService, UrlService } from './services';

@Module({
  imports: [ConfigModule],
  providers: [ResourceUniqueIdService, UrlService],
  exports: [ResourceUniqueIdService, UrlService],
})
export class LibModule {}
