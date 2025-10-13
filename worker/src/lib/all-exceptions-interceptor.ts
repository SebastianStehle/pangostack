import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import { safeStringify } from './log';

@Injectable()
export class AllExceptionsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AllExceptionsInterceptor.name);

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const message = error instanceof Error ? error.message : 'Unknown error';

        const stack =
          error instanceof Error //
            ? error.stack //
            : error?.stack || (typeof error === 'object' ? safeStringify(error) : '');

        this.logger.error(message, stack);

        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        const payload: Record<string, unknown> = { statusCode: 500 };

        const outMessage = error?.message;
        if (typeof outMessage === 'string') {
          payload.message = outMessage;
        }

        if (typeof error === 'object' && Object.keys(error).length > 0) {
          payload.cause = error;
        }

        const internalError = new InternalServerErrorException(payload);
        return throwError(() => internalError);
      }),
    );
  }
}
