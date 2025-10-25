import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface WorkflowConfig {
  temporal: {
    address?: string;
    apiKey?: string;
  };
}

export const WORKFLOW_ENV_SCHEMA = Joi.object({
  TEMPORAL_ADDRESS: Joi.string().optional(),
  TEMPORAL_APIKEY: Joi.string().optional(),
}).unknown(true);

export const workflowConfig = registerAs<WorkflowConfig>('workflow', () => ({
  temporal: {
    address: process.env.TEMPORAL_ADDRESS!,
    apiKey: process.env.TEMPORAL_APIKEY!,
  },
}));
