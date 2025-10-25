import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface DbConfig {
  type: 'postgres';
  url: string;
}

export const DB_ENV_SCHEMA = Joi.object({
  DB_URL: Joi.string().uri().required(),
}).unknown(true);

export const dbConfig = registerAs<DbConfig>('db', () => ({
  type: 'postgres',
  url: process.env.DB_URL!,
}));
