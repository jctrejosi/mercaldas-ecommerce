/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { exec } from 'child_process';
import { promisify } from 'util';
import { Pool } from 'pg';

const execAsync = promisify(exec);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

async function tableExists(pool: Pool, tableName: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    )`,
    [tableName],
  );
  return result.rows[0]?.exists === true;
}

async function hasData(pool: Pool, tableName: string): Promise<boolean> {
  const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
  return parseInt(result.rows[0].count) > 0;
}

async function runCommand(command: string, label: string): Promise<void> {
  console.log(`🚀 ${label}...`);
  try {
    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env, DATABASE_URL },
    });
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    console.log(`✅ ${label} completado`);
  } catch (error: any) {
    console.error(`❌ ${label} falló:`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}

async function migrate() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    // Verificar si la BD ya tiene tablas/productos
    const productsTableExists = await tableExists(pool, 'products');

    if (!productsTableExists) {
      // ── BD nueva: migración completa ──
      console.log(
        '🆕 Base de datos nueva detectada. Ejecutando migración completa...',
      );

      // 1. Crear tablas
      await runCommand('yarn db:push', 'Creación de tablas (db:push)');

      // 2. Seed de usuarios/base
      await runCommand('yarn seed:run', 'Seed de usuarios (seed:run)');

      // 3. Importar productos
      await runCommand(
        'yarn import:run',
        'Importación de productos (import:run)',
      );
    } else {
      const hasProductData = await hasData(pool, 'products');

      if (!hasProductData) {
        // ── BD con tabla products vacía: seed + import ──
        console.log(
          '📋 Tabla products existe pero está vacía. Ejecutando seed + import...',
        );

        await runCommand('yarn seed:run', 'Seed de usuarios (seed:run)');
        await runCommand(
          'yarn import:run',
          'Importación de productos (import:run)',
        );
      } else {
        // ── BD existente con datos: solo actualizar esquema ──
        console.log(
          '♻️ Base de datos existente con productos. Solo actualizando esquema...',
        );
        await runCommand('yarn db:push', 'Actualización de esquema (db:push)');
      }
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error: any) {
    console.error('❌ Error en migración:', error.message);
    // No hacer exit(1) — Render no debe parar el deploy por un error de migración
  } finally {
    await pool.end();
  }
}

void migrate().then(() => process.exit(0));
