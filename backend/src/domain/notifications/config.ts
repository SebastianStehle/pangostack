import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface NotificationConfig {
  notifo?: NotifoConfig;
}

export interface NotifoConfig {
  apiKey: string;
  apiUrl: string;
  appId: string;
}

export const NOTIFICATION_CONFIG_SCHEMA = Joi.object({
  notifo: Joi.object({
    apiKey: Joi.string().required(),
    apiUrl: Joi.string().uri().required(),
    appId: Joi.string().required(),
  }).optional(),
});

export const notificationConfig = registerAs<NotificationConfig>('notification', () => {
  const apiKey = process.env.NOTIFICATION_NOTIFO_APIKEY;
  const apiUrl = process.env.NOTIFICATION_NOTIFO_APIURL;
  const appId = process.env.NOTIFICATION_NOTIFO_APPID;

  if (apiKey && apiUrl && appId) {
    return {
      notifo: {
        apiKey,
        apiUrl,
        appId,
      },
    };
  }

  return {};
});
