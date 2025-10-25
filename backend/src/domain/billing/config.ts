import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { parseEnvironmentMap } from 'src/lib';

export type BillingConfig = { type: 'chargebee'; chargebee: ChargebeeConfig } | { type: 'none'; chargebee?: never };

export interface ChargebeeConfig {
  site: string;
  apiKey: string;
  addons: Record<string, string>;
  planId: string;
  teamPrefix?: string;
}

export const BILLING_CONFIG_SCHEMA = Joi.object<BillingConfig>({
  type: Joi.string().valid('chargebee', 'none').required(),
  chargebee: Joi.when('type', {
    is: 'chargebee',
    then: Joi.object({
      site: Joi.string().required(),
      apiKey: Joi.string().required(),
      addons: Joi.object().pattern(Joi.string(), Joi.string()).required(),
      planId: Joi.string().required(),
      teamPrefix: Joi.string().optional(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
});

export const billingConfig = registerAs('billing', () => {
  const type = process.env.BILLING_TYPE as 'chargebee' | 'none' | undefined;

  return {
    type: type || 'none',
    ...(type === 'chargebee' && {
      chargebee: {
        site: process.env.BILLING_CHARGEBEE_SITE || '',
        apiKey: process.env.BILLING_CHARGEBEE_APIKEY || '',
        addons: parseEnvironmentMap('BILLING_CHARGEBEE_ADDON_'),
        planId: process.env.BILLING_CHARGEBEE_PLAN_ID || '',
        teamPrefix: process.env.BILLING_CHARGEBEE_TEAMPREFIX,
      },
    }),
  } as BillingConfig;
});
