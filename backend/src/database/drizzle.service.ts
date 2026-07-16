import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor(private configService: ConfigService) {
    const databaseUrl =
      this.configService.get<string>('database.url') ??
      process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL is not defined. Please check your .env file or environment variables.',
      );
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20, // Máximo de conexiones en el pool
      idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar conexión
      connectionTimeoutMillis: 2000, // Timeout de conexión
      // Opciones adicionales para PostgreSQL
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

    this.db = drizzle(this.pool, {
      schema,
      // mode: 'default', // No es necesario para PostgreSQL
    });
  }

  async onModuleInit() {
    // Verificar conexión al iniciar el módulo
    try {
      await this.pool.query('SELECT 1');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    // Cerrar el pool de conexiones al destruir el módulo
    await this.pool.end();
    console.log('🔌 Database connection closed');
  }

  // Método para ejecutar queries SQL raw (cuando sea necesario)
  async execute<T = any>(query: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(query, params);
    return result.rows as T[];
  }

  // Método para obtener una transacción
  async transaction<T>(
    callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const txDb = drizzle(client, { schema });
      const result = await callback(txDb);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
