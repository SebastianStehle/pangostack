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

export const BILLING_ENV_SCHEMA = Joi.object({
  BILLING_TYPE: Joi.string().valid('chargebee', 'none').default('none'),
  BILLING_CHARGEBEE_SITE: Joi.when('BILLING_TYPE', {
    is: 'chargebee',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  BILLING_CHARGEBEE_APIKEY: Joi.when('BILLING_TYPE', {
    is: 'chargebee',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  BILLING_CHARGEBEE_PLAN_ID: Joi.when('BILLING_TYPE', {
    is: 'chargebee',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  BILLING_CHARGEBEE_TEAMPREFIX: Joi.string().optional(),
}).unknown(true);

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
