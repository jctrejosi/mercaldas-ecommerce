import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DrizzleService } from './database/drizzle.service';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  /**
   * Validar conexión a la base de datos al iniciar
   */
  async onModuleInit() {
    await this.checkDatabaseConnection();
  }

  /**
   * Verifica la conexión a la base de datos
   */
  async checkDatabaseConnection(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    try {
      const result = await this.drizzle.execute(
        'SELECT NOW() as current_time, version() as pg_version',
      );

      this.logger.log('✅ Database connection successful');
      this.logger.log(
        `📊 PostgreSQL version: ${result[0]?.pg_version?.split(',')[0] || 'unknown'}`,
      );

      return {
        status: 'connected',
        message: 'Database connection successful',
        timestamp: result[0]?.current_time || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        '❌ Database connection failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );

      return {
        status: 'disconnected',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtiene el estado de la aplicación (health check)
   */
  async getHealth() {
    const dbStatus = await this.checkDatabaseConnection();

    return {
      status: dbStatus.status === 'connected' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
    };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
