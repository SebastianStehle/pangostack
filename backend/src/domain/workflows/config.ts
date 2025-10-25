import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface WorkflowConfig {
  temporal: {
    address: string;
    apiKey: string;
  };
}

export const WORKFLOW_CONFIG_SCHEMA = Joi.object<WorkflowConfig>({
  temporal: Joi.object<WorkflowConfig['temporal']>({
    address: Joi.string().required(),
    apiKey: Joi.string().required(),
  }),
});

export const workflowConfig = registerAs<WorkflowConfig>('workflow', () => ({
  temporal: {
    address: process.env.TEMPORAL_ADDRESS!,
    apiKey: process.env.TEMPORAL_APIKEY!,
  },
}));
