import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class AllExceptionsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AllExceptionsInterceptor.name);

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof Error) {
          this.logger.error(error.message, error.stack);
        } else {
          this.logger.error('Non-error thrown', JSON.stringify(error));
        }

        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        const payload: any = { statusCode: 500 };

        const message = error?.message;
        if (typeof message === 'string') {
          payload.message = message;
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
