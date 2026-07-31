/**
 * Script: dump-prod-to-local.ts
 * Vuelca datos desde la BD de producción a la BD local.
 *
 * Uso: npx tsx scripts/dump-prod-to-local.ts
 *
 * Requisitos: Tener configuradas las DATABASE_URL en:
 *   - .env.production.local  (origen)
 *   - .env.development.local (destino)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Quitar comillas
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username ? '***' : ''}@${u.hostname}:${u.port}${u.pathname}`;
  } catch {
    return url.replace(/\/\/[^@]+@/, '//***@');
  }
}

// ─── Conexiones ─────────────────────────────────────────────────────────────

const BACKEND_DIR = path.resolve(__dirname, '..');
const PROD_ENV = parseEnvFile(path.join(BACKEND_DIR, '.env.production.local'));
const DEV_ENV = parseEnvFile(path.join(BACKEND_DIR, '.env.development.local'));

const PROD_URL = PROD_ENV['DATABASE_URL'] ?? '';
const LOCAL_URL = DEV_ENV['DATABASE_URL'] ?? '';

if (!PROD_URL || PROD_URL.includes('user:password@host')) {
  console.error('❌ DATABASE_URL de producción no configurada o es placeholder.');
  process.exit(1);
}
if (!LOCAL_URL) {
  console.error('❌ DATABASE_URL local no configurada.');
  process.exit(1);
}

const TABLES_TO_SKIP = new Set([
  'spatial_ref_sys',
  'geography_columns',
  'geometry_columns',
]);

// Pool de producción (solo lectura, 1 conexión)
const prodPool = new Pool({
  connectionString: PROD_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false },
});

// Pool local
const localPool = new Pool({
  connectionString: LOCAL_URL,
  max: 1,
});

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('════════════════════════════════════════════════════════');
  console.log('  DUMP DE PRODUCCIÓN → LOCAL (Node.js)');
  console.log('════════════════════════════════════════════════════════');
  console.log(`\n📍 Origen:  ${maskUrl(PROD_URL)}`);
  console.log(`📍 Destino: ${maskUrl(LOCAL_URL)}\n`);

  // ── 1. Obtener tablas ──────────────────────────────────────────────────
  console.log('📋 [1/5] Listando tablas de producción...');
  const { rows: tables } = await prodPool.query<{ tablename: string }>(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  const tableNames = tables
    .map((t) => t.tablename)
    .filter((t) => !TABLES_TO_SKIP.has(t));

  console.log(`   ${tableNames.length} tablas encontradas.\n`);

  // ── 2. Extraer datos de producción ─────────────────────────────────────
  console.log('📦 [2/5] Extrayendo datos de producción...');
  const allData: Map<string, { columns: string[]; rows: Record<string, unknown>[] }> = new Map();

  for (const table of tableNames) {
    // Obtener columnas
    const { rows: cols } = await prodPool.query<{ column_name: string }>(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `,
      [table],
    );
    const columnNames = cols.map((c) => c.column_name);

    // Obtener filas
    const { rows: data } = await prodPool.query(
      `SELECT * FROM "${table}"`,
    );

    allData.set(table, { columns: columnNames, rows: data });
    console.log(`   ${table}: ${data.length} filas`);
  }

  const totalRows = [...allData.values()].reduce((sum, d) => sum + d.rows.length, 0);
  console.log(`   Total: ${totalRows} filas en ${tableNames.length} tablas.\n`);

  // ── 3. Limpiar tablas locales ──────────────────────────────────────────
  console.log('🧹 [3/5] Limpiando tablas locales...');
  const localClient = await localPool.connect();
  try {
    await localClient.query('BEGIN');

    // Deshabilitar triggers de FK para toda la sesión
    await localClient.query('SET session_replication_role = replica');

    // Truncar
    for (const table of tableNames) {
      await localClient.query(`TRUNCATE TABLE "${table}" CASCADE`);
    }

    console.log('   ✅ Tablas limpiadas.\n');

  // ── 4. Insertar datos en local ─────────────────────────────────────────
  console.log('📥 [4/5] Insertando datos en local...');

  // Obtener columnas reales de cada tabla local para filtrar
  const localColumns = new Map<string, Set<string>>();
  for (const table of tableNames) {
    const { rows: cols } = await localClient.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [table],
    );
    localColumns.set(table, new Set(cols.map((c) => c.column_name)));
  }

  // Hacer los inserts en lotes (batch) para mejor rendimiento
  for (const [table, { columns, rows }] of allData) {
    if (rows.length === 0) {
      console.log(`   ${table}: 0 filas (omitida)`);
      continue;
    }

    // Filtrar solo columnas que existen en la tabla local
    const targetCols = localColumns.get(table);
    if (!targetCols) {
      console.log(`   ${table}: tabla no existe en local (omitida)`);
      continue;
    }
    const validColumns = columns.filter((c) => targetCols.has(c));
    const skippedCols = columns.filter((c) => !targetCols.has(c));

    const colList = validColumns.map((c) => `"${c}"`).join(', ');

    // Insertar en lotes de 100 filas
    const BATCH_SIZE = 100;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const valuePlaceholders: string[] = [];
      const params: unknown[] = [];
      let paramIdx = 0;

      for (const row of batch) {
        const placeholders = validColumns.map(() => {
          paramIdx++;
          return `$${paramIdx}`;
        });
        valuePlaceholders.push(`(${placeholders.join(', ')})`);
        for (const col of validColumns) {
          const val = row[col];
          // Serializar objetos/arrays a JSON para columnas json/jsonb
          params.push(
            val !== null && typeof val === 'object'
              ? JSON.stringify(val)
              : val,
          );
        }
      }

      await localClient.query(
        `INSERT INTO "${table}" (${colList}) VALUES ${valuePlaceholders.join(', ')} ON CONFLICT DO NOTHING`,
        params,
      );
    }

    if (skippedCols.length > 0) {
      console.log(`   ${table}: ${rows.length} filas insertadas (columnas omitidas: ${skippedCols.join(', ')})`);
    } else {
      console.log(`   ${table}: ${rows.length} filas insertadas`);
    }
  }

  console.log(`   ✅ ${totalRows} filas insertadas.\n`);

  // ── 5. Reiniciar secuencias ────────────────────────────────────────────
  console.log('🔄 [5/5] Reiniciando secuencias...');

  const { rows: sequences } = await localClient.query<{
    sequence_name: string;
    table_name: string;
    column_name: string;
  }>(`
    SELECT
      s.relname AS sequence_name,
      t.relname AS table_name,
      a.attname AS column_name
    FROM pg_class s
    JOIN pg_depend d ON d.objid = s.oid
    JOIN pg_class t ON d.refobjid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
    WHERE s.relkind = 'S'
      AND s.relnamespace = 'public'::regnamespace
  `);

  for (const seq of sequences) {
    const { rows: maxRow } = await localClient.query(
      `SELECT COALESCE(MAX("${seq.column_name}"), 0) AS max_val FROM "${seq.table_name}"`,
    );
    const nextVal = Number(maxRow[0].max_val) + 1;
    await localClient.query(
      `ALTER SEQUENCE "${seq.sequence_name}" RESTART WITH ${nextVal}`,
    );
  }
  console.log(`   ✅ ${sequences.length} secuencias reiniciadas.`);

  // Restaurar configuración y hacer commit
  await localClient.query('SET session_replication_role = origin');
  await localClient.query('COMMIT');
  localClient.release();

  // ── Resumen ────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  ✅ DUMP COMPLETADO EXITOSAMENTE');
  console.log('════════════════════════════════════════════════════════');
  } catch (err) {
    await localClient.query('ROLLBACK');
    localClient.release();
    throw err;
  }
}

main()
  .catch((err) => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prodPool.end();
    await localPool.end();
  });
