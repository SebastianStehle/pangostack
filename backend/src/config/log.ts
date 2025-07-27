import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { prettyFormat, prettyJson } from 'src/lib';

export function configureLogger() {
  return WinstonModule.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(), //
      prettyFormat(),
      prettyJson(),
    ),
    transports: [new winston.transports.Console({})],
  });
}
