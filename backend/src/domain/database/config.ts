import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface DbConfig {
  type: 'postgres';
  url: string;
}

export const DB_CONFIG_SCHEMA = Joi.object<DbConfig>({
  type: Joi.string().valid('postgres').required(),
  url: Joi.string().uri().required(),
});

export const dbConfig = registerAs<DbConfig>('db', () => ({
  type: 'postgres',
  url: process.env.DB_URL!,
}));
