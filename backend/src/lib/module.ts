import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UrlService } from './services';

@Module({
  imports: [ConfigModule],
  providers: [UrlService],
  exports: [UrlService],
})
export class LibModule {}
