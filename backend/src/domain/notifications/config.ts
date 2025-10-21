import { registerAs } from '@nestjs/config';
import { NotifoConfig } from './services';

export const notifoConfig = registerAs(
  'notifo',
  () =>
    ({
      apiKey: process.env.NOTIFO_APIKEY,
      apiUrl: process.env.NOTIFO_APIURL,
      appId: process.env.NOTIFO_APPID,
    }) as NotifoConfig,
);
