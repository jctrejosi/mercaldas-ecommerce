import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { CorsConfig, HelmetConfig } from './config/types';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    // Opciones de la app
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') ?? 3000;
  const nodeEnv = configService.get<string>('app.nodeEnv') ?? 'development';

  // =============================================
  // 1. Global Prefix (opcional)
  // =============================================
  // app.setGlobalPrefix('api/v1');

  // =============================================
  // 2. CORS
  // =============================================
  const corsConfig = configService.get<CorsConfig>('cors');
  app.enableCors(corsConfig);

  // =============================================
  // 3. Helmet (Seguridad)
  // =============================================
  const helmetConfig = configService.get<HelmetConfig>('helmet');
  if (nodeEnv === 'production') {
    // Importar helmet solo en producción para evitar overhead en desarrollo
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const helmet = require('helmet');
    app.use(helmet(helmetConfig));
  }

  // =============================================
  // 4. Validation Pipe
  // =============================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en los DTOs
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no definidas
      transform: true, // Transforma automáticamente los payloads
      transformOptions: {
        enableImplicitConversion: false, // No convertir implícitamente tipos
      },
      // Validar grupos (para diferentes casos de uso)
      // groups: [],
      // Validar tipos
      // validateCustomDecorators: true,
      // Mensajes de error detallados (solo en desarrollo)
      disableErrorMessages: nodeEnv === 'production',
    }),
  );

  // =============================================
  // 5. Swagger (solo en desarrollo)
  // =============================================
  if (nodeEnv !== 'production') {
    setupSwagger(app);
  }

  // =============================================
  // 6. Compresión (opcional)
  // =============================================
  // if (nodeEnv === 'production') {
  //   const compression = require('compression');
  //   app.use(compression());
  // }

  // =============================================
  // 7. Iniciar servidor
  // =============================================
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger: http://localhost:${port}/docs`);
  logger.log(`🔧 Environment: ${nodeEnv}`);
}
bootstrap();
