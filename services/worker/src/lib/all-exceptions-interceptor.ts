import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class AllExceptionsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
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
