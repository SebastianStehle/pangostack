import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface WorkerConfig {
  endpoint?: string;
}

export const WORKER_CONFIG_SCHEMA = Joi.object<WorkerConfig>({
  endpoint: Joi.string().uri().optional(),
});

export const workerConfig = registerAs<WorkerConfig>('worker', () => ({
  endpoint: process.env.WORKER_ENDPOINT,
}));
