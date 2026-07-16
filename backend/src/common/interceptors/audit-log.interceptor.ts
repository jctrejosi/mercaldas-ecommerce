import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditLogService } from '../../modules/audit/audit-log.service';

interface AuthenticatedRequest extends Request {
  user?: {
    sub?: number;
    username?: string;
  };
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const response = context.switchToHttp().getResponse<Response>();

    const controller = context.getClass();

    // Solo registrar métodos de escritura
    const method = request.method;

    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const accountId = request.user?.sub ?? null;

    const forwardedFor = request.headers['x-forwarded-for'];

    const ip =
      typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : Array.isArray(forwardedFor)
          ? forwardedFor[0].trim()
          : request.ip || request.socket.remoteAddress || 'unknown';

    const userAgent =
      typeof request.headers['user-agent'] === 'string'
        ? request.headers['user-agent']
        : 'unknown';

    const entityName = controller.name.replace('Controller', '');

    const entityId =
      request.params.id !== undefined
        ? Number.parseInt(
            Array.isArray(request.params.id)
              ? request.params.id[0]
              : request.params.id,
            10,
          )
        : undefined;

    const oldValues: Record<string, unknown> | undefined = undefined;

    const isUpdateOrDelete = ['PUT', 'PATCH', 'DELETE'].includes(method);

    return next.handle().pipe(
      tap({
        next: (): void => {
          const newValues: Record<string, unknown> | undefined = undefined;

          if (isUpdateOrDelete || method === 'POST') {
            this.auditLogService
              .log({
                accountId,
                moduleName: entityName,
                action: this.getActionName(method),
                entityName,
                entityId,
                oldValues,
                newValues,
                ip,
                userAgent,
                metadata: {
                  endpoint: request.originalUrl,
                  method,
                  statusCode: response.statusCode,
                },
              })
              .catch((error) => {
                console.error('Failed to log audit data:', error);
              });
          }
        },

        error: (error: unknown): void => {
          const newValues: Record<string, unknown> =
            error instanceof Error
              ? {
                  error: error.message,
                  stack: error.stack,
                }
              : {
                  error: String(error),
                };

          this.auditLogService.log({
            accountId,
            moduleName: entityName,
            action: `${this.getActionName(method)}_ERROR`,
            entityName,
            entityId,
            oldValues,
            newValues,
            ip,
            userAgent,
            metadata: {
              endpoint: request.originalUrl,
              method,
              error: true,
              statusCode:
                error instanceof Error &&
                'status' in error &&
                typeof (error as { status?: unknown }).status === 'number'
                  ? (error as { status: number }).status
                  : 500,
            },
          });
        },
      }),
    );
  }

  private getActionName(method: string): string {
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    return actionMap[method] ?? method;
  }
}
