import * as Sentry from '@sentry/node';

type Method<TArgs extends unknown[] = unknown[], TResult = unknown> = (
  this: unknown,
  ...args: TArgs
) => TResult;

export function SentryTrace(name?: string, op = 'function'): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    if (typeof descriptor.value !== 'function') {
      throw new Error('SentryTrace solo puede aplicarse a métodos.');
    }

    const originalMethod = descriptor.value as Method;

    const className = (target as { constructor: { name: string } }).constructor
      .name;

    const spanName = name ?? `${className}.${String(propertyKey)}`;

    descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
      return Sentry.startSpan(
        {
          name: spanName,
          op,
          attributes: {
            args_count: args.length,
          },
        },
        () => {
          try {
            const result = Reflect.apply(originalMethod, this, args);

            if (result instanceof Promise) {
              return result.catch((error: unknown) => {
                if (error instanceof Error) {
                  Sentry.captureException(error);
                } else {
                  Sentry.captureMessage(String(error), 'error');
                }

                throw error;
              });
            }

            return result;
          } catch (error) {
            if (error instanceof Error) {
              Sentry.captureException(error);
            } else {
              Sentry.captureMessage(String(error), 'error');
            }

            throw error;
          }
        },
      );
    };
  };
}
