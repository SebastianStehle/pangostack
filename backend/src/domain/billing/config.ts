import { registerAs } from '@nestjs/config';

export const billingConfig = registerAs('billing', () => ({
  type: process.env.BILLING_TYPE,
  chargebee: {
    site: process.env.BILLING_CHARGEBEE_SITE,
    apiKey: process.env.BILLING_CHARGEBEE_APIKEY,
    addOnIdCPU: process.env.BILLING_CHARGEBEE_ADDON_ID_CPU,
    addOnIdMemory: process.env.BILLING_CHARGEBEE_ADDON_ID_MEMORY,
    addOnIdStorage: process.env.BILLING_CHARGEBEE_ADDON_ID_STORAGE,
    addOnIdVolume: process.env.BILLING_CHARGEBEE_ADDON_ID_VOLUME,
    fixedPriceDescription: process.env.BILLING_CHARGEBEE_FIXED_PRICE_DESCRIPTION,
    planId: process.env.BILLING_CHARGEBEE_PLAN_ID,
  },
}));
