import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/ecommerce";

const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

const TIDTAB_PATH = "data/TIDTAB_0.JSON";

async function main() {
  // Build tidtab name by code map
  const raw = JSON.parse(readFileSync(TIDTAB_PATH, "utf-8"));
  const tidtabNameByCode = new Map<string, string>(
    raw.TABLAS.map((t: { CODIGO: string; NOMBRE: string }) => [
      t.CODIGO.trim(),
      t.NOMBRE.trim(),
    ]),
  );

  // Fetch all product types that have matching tidtab codes
  const allTypes = await db
    .select({ id: schema.productTypes.id, code: schema.productTypes.code, name: schema.productTypes.name })
    .from(schema.productTypes)
    .orderBy(schema.productTypes.code);

  let updated = 0;
  let skipped = 0;

  for (const pt of allTypes) {
    const tidName = tidtabNameByCode.get(pt.code);
    if (tidName && pt.name !== tidName) {
      await db
        .update(schema.productTypes)
        .set({ name: tidName, description: `Clasificación transversal (${pt.code})` })
        .where(eq(schema.productTypes.id, pt.id));
      console.log(`✅ ${pt.code.padEnd(5)} "${pt.name}" → "${tidName}"`);
      updated++;
    } else if (tidName) {
      console.log(`⏭️  ${pt.code.padEnd(5)} ya tiene el nombre correcto "${tidName}"`);
      skipped++;
    } else {
      console.log(`❌ ${pt.code.padEnd(5)} "${pt.name}" — sin coincidencia en TIDTAB`);
      skipped++;
    }
  }

  console.log(`\n📊 Resultado: ${updated} actualizados, ${skipped} omitidos`);
  await pool.end();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
