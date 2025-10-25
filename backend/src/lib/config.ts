import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface UrlsConfig {
  baseUrl?: string;
  baseUI?: string;
}

export const URLS_ENV_SCHEMA = Joi.object({
  URLS_BASEURL: Joi.string().uri().optional(),
  URLS_BASEUIURL: Joi.string().uri().optional(),
}).unknown(true);

export const urlsConfig = registerAs<UrlsConfig>('urls', () => ({
  baseUrl: process.env.URLS_BASEURL,
  baseUI: process.env.URLS_BASEUIURL,
}));
