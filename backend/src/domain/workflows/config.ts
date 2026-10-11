import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { DEPLOYMENT_STEP_MAX_ATTEMPTS } from './constants';

export interface WorkflowConfig {
  temporal?: {
    address?: string;
    apiKey?: string;
  };
  metrics: {
    maxAge: string;
    maxCount: number;
  };
  deploymentStep: {
    maxAttempts: number;
  };
}

export const WORKFLOW_ENV_SCHEMA = Joi.object({
  WORKFLOW_TEMPORAL_ADDRESS: Joi.string().optional(),
  WORKFLOW_TEMPORAL_APIKEY: Joi.string().optional(),
  WORKFLOW_METRICS_MAX_AGE: Joi.string()
    .pattern(/^\d+\s*(s|m|h|d)$/)
    .optional(),
  WORKFLOW_METRICS_MAX_COUNT: Joi.number().optional(),
  WORKFLOW_STEP_MAX_ATTEMPTS: Joi.number().integer().min(1).optional(),
}).unknown(true);

export const workflowConfig = registerAs<WorkflowConfig>('workflow', () => ({
  temporal: {
    address: process.env.WORKFLOW_TEMPORAL_ADDRESS,
    apiKey: process.env.WORKFLOW_TEMPORAL_APIKEY,
  },
  metrics: {
    maxAge: process.env.WORKFLOW_METRICS_MAX_AGE || '90d',
    maxCount: +(process.env.WORKFLOW_METRICS_MAX_COUNT || 10000),
  },
  deploymentStep: {
    maxAttempts: +(process.env.WORKFLOW_STEP_MAX_ATTEMPTS || DEPLOYMENT_STEP_MAX_ATTEMPTS),
  },
}));
