import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appCookies, appSession, configureDevCert, configureLogger, configureSwagger } from './config';
import { configureCors } from './config/cors';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function bootstrap() {
  // Only use https for development, usually handled by an ingress.
  const httpsOptions = IS_PRODUCTION ? undefined : configureDevCert();

  const app = await NestFactory.create(AppModule, { logger: configureLogger(), httpsOptions });

  // Only us cors for development, where the ports are different.
  if (!IS_PRODUCTION) {
    configureCors(app);
  }

  configureSwagger(app);

  app.use(appSession(app));
  app.use(appCookies());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
