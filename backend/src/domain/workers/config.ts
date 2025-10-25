import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface WorkerConfig {
  endpoint?: string;
}

export const WORKER_ENV_SCHEMA = Joi.object({
  WORKER_ENDPOINT: Joi.string().uri().optional(),
}).unknown(true);

export const workerConfig = registerAs<WorkerConfig>('worker', () => ({
  endpoint: process.env.WORKER_ENDPOINT,
}));
