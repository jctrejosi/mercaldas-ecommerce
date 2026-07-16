import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    sub?: string;
    username?: string;
  };
}

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return Sentry.startSpan(
      {
        name: `${request.method} ${request.originalUrl}`,
        op: 'http.server',
        attributes: {
          method: request.method,
          url: request.originalUrl,
        },
      },
      () =>
        next.handle().pipe(
          catchError((error: unknown) => {
            Sentry.withScope((scope) => {
              scope.setTag('method', request.method);
              scope.setTag('url', request.originalUrl);

              if (request.ip) {
                scope.setTag('ip', request.ip);
              }

              if (request.user) {
                scope.setUser({
                  id: request.user.sub,
                  username: request.user.username,
                });
              }

              scope.setContext('request', {
                method: request.method,
                url: request.originalUrl,
                headers: request.headers,
                query: request.query,
                params: request.params,
              });

              if (error instanceof Error) {
                Sentry.captureException(error);
              } else {
                Sentry.captureMessage(String(error), 'error');
              }
            });

            return throwError(() => error);
          }),
        ),
    );
  }
}
