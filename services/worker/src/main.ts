import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { PrettyFormat } from './lib';
import { AllExceptionsInterceptor } from './lib/all-exceptions-interceptor';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const format = IS_PRODUCTION //
  ? winston.format.json()
  : winston.format.simple();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.combine(
        new PrettyFormat(),
        winston.format.timestamp(), //
        format,
      ),
      transports: [new winston.transports.Console({})],
    }),
  });

  const config = new DocumentBuilder() //
    .setTitle('OmniSaaS')
    .setDescription('Worker')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new AllExceptionsInterceptor());
  await app.listen(3100);
}
bootstrap();
