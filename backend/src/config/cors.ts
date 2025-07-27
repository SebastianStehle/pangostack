import { INestApplication } from '@nestjs/common';
import { DEV_SERVER } from './dev';

export function configureCors(app: INestApplication) {
  app.enableCors({
    origin: DEV_SERVER,
    // The frontend uses cookie authentication, but from another domain in process mode.
    credentials: true,
  });
}
