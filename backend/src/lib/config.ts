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

// Short enough to leave room for the resource ID in providers that truncate names (GCP, Azure and Helm).
export const INSTALL_ID_MAX_LENGTH = 8;

export interface InstallConfig {
  installId?: string;
}

// No underscores, because the ID is separated from the rest of the resource unique ID by one.
export const INSTALL_ENV_SCHEMA = Joi.object({
  INSTALL_ID: Joi.string()
    .pattern(/^[a-z0-9]+$/)
    .max(INSTALL_ID_MAX_LENGTH)
    .allow('')
    .optional(),
}).unknown(true);

export const installConfig = registerAs<InstallConfig>('install', () => ({
  installId: process.env.INSTALL_ID,
}));
