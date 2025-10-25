import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { ChargebeeBillingService } from './chargebee/chargebee-billing.service';
import { BillingConfig } from './config';
import { BillingService } from './interface';
import { NoopBillingService } from './noop/noop-billing.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: BillingService,
      inject: [ConfigService, ModuleRef],
      useFactory: async (configService: ConfigService, moduleRef: ModuleRef) => {
        const config = configService.getOrThrow<BillingConfig>('billing');
        if (config.type === 'chargebee') {
          return moduleRef.create(ChargebeeBillingService);
        } else {
          return moduleRef.create(NoopBillingService);
        }
      },
    },
  ],
  exports: [BillingService],
})
export class BillingModule {}
