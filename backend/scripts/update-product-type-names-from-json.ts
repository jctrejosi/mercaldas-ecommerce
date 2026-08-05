// Actualiza nombres y estado de tipos de producto desde data/JSON/TIPOS_PRODUCTOS.JSON
// No borra datos existentes: solo hace upsert por código.
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import 'dotenv/config';
import { readFileSync } from 'fs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import * as schema from '../drizzle/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  const raw = JSON.parse(
    readFileSync('data/JSON/TIPOS_PRODUCTOS.JSON', 'latin1'),
  );
  const rows = raw.TIPOS_PRODUCTOS ?? [];

  console.log(`📋 Procesando ${rows.length} tipos de producto...`);

  let updated = 0;
  let inserted = 0;

  for (const r of rows) {
    const code = (r.CODIGO ?? '').trim();
    const name = (r.NOMBRE ?? '').trim();
    const isActive = (r.PUBLICA ?? '').trim() === '1';
    if (!code || !name) continue;

    const existing = await db
      .select({ id: schema.productTypes.id })
      .from(schema.productTypes)
      .where(eq(schema.productTypes.code, code))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.productTypes)
        .set({ name, isActive, description: name })
        .where(eq(schema.productTypes.id, existing[0].id));
      updated++;
    } else {
      await db.insert(schema.productTypes).values({
        code,
        name,
        isActive,
        description: name,
      });
      inserted++;
    }
  }

  console.log(`✅ ${updated} actualizados, ${inserted} insertados`);
  await pool.end();
}

void main();
