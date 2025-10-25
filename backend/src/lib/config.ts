import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface UrlsConfig {
  baseUrl?: string;
  uiUrl?: string;
}

export const URLS_CONFIG_SCHEMA = Joi.object<UrlsConfig>({
  baseUrl: Joi.string().uri().optional(),
  uiUrl: Joi.string().uri().optional(),
});

export const urlsConfig = registerAs<UrlsConfig>('urls', () => ({
  baseUrl: process.env.URLS_BASEURL,
  uiUrl: process.env.URLS_UIURL,
}));
