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

export const NOTIFICATION_ENV_SCHEMA = Joi.object({
  NOTIFO_API_KEY: Joi.string().optional(),
  NOTIFO_API_URL: Joi.when('NOTIFO_API_KEY', {
    is: Joi.exist(),
    then: Joi.string().uri().required(),
    otherwise: Joi.string().optional(),
  }),
  NOTIFO_APP_ID: Joi.when('NOTIFO_API_KEY', {
    is: Joi.exist(),
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
}).unknown(true);

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
