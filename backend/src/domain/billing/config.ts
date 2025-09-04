import { registerAs } from '@nestjs/config';
import { parseEnvironmentMap } from 'src/lib';
import { ChargebeeConfig } from './chargebee/chargebee-billing.service';

export const billingConfig = registerAs('billing', () => ({
  type: process.env.BILLING_TYPE,
  chargebee: {
    site: process.env.BILLING_CHARGEBEE_SITE,
    apiKey: process.env.BILLING_CHARGEBEE_APIKEY,
    addons: parseEnvironmentMap('BILLING_CHARGEBEE_ADDON_'),
    planId: process.env.BILLING_CHARGEBEE_PLAN_ID,
    teamPrefix: process.env.BILLING_CHARGEBEE_TEAMPREFIX,
  } as ChargebeeConfig,
}));
