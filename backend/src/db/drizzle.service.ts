import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db: ReturnType<typeof drizzle<typeof schema>>;
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('database.url');

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    // Verificar conexión
    try {
      await this.pool.query('SELECT 1');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  // Método para ejecutar queries SQL raw (cuando sea necesario)
  async execute<T = any>(query: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(query, params);
    return result.rows;
  }
}
