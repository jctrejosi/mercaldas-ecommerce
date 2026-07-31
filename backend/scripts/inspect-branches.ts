/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import 'dotenv/config';
import fs from 'node:fs';
import { Pool } from 'pg';

function loadEnvFile(file: string): Record<string, string> {
  const env: Record<string, string> = {};
  if (!fs.existsSync(file)) return env;
  for (const rawLine of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function dump(dbLabel: string, url: string | undefined) {
  if (!url) {
    console.log(`\n=== ${dbLabel}: NO URL ===`);
    return;
  }
  const pool = new Pool({ connectionString: url });
  try {
    console.log(`\n=== ${dbLabel} ===`);
    const branches = await pool.query('SELECT * FROM branches ORDER BY id');
    console.log(`-- branches (${branches.rowCount}):`);
    for (const row of branches.rows) {
      console.log(JSON.stringify(row));
    }

    const inv = await pool.query(
      'SELECT branch_id, count(*) AS n, sum(stock) AS total_stock FROM inventory GROUP BY branch_id ORDER BY branch_id',
    );
    console.log(`-- inventory by branch (${inv.rowCount}):`);
    for (const row of inv.rows) {
      console.log(JSON.stringify(row));
    }

    const refs = await pool.query(
      `SELECT tc.table_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND ccu.table_name = 'branches'
       GROUP BY tc.table_name`,
    );
    console.log(`-- tables with FK to branches: ${refs.rows.map((r) => r.table_name).join(', ') || 'none'}`);

    const stores = await pool.query('SELECT id, name FROM stores ORDER BY id');
    console.log(`-- stores (${stores.rowCount}):`);
    for (const row of stores.rows) {
      console.log(JSON.stringify(row));
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  const local = loadEnvFile('.env.development.local');
  const prod = loadEnvFile('.env.production.local');
  await dump('LOCAL', local.DATABASE_URL);
  await dump('PROD', prod.DATABASE_URL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
