/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Pool } from 'pg';

async function inspect(url: string, label: string) {
  const pool = new Pool({ connectionString: url });
  try {
    console.log(`\n===== ${label} =====`);

    // Schema de branches en esta BD
    const cols = await pool.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns
       WHERE table_name = 'branches' ORDER BY ordinal_position`,
    );
    console.log('Columnas branches:');
    for (const c of cols.rows) {
      console.log(
        `  ${c.column_name}: ${c.data_type} nullable=${c.is_nullable} default=${c.column_default ?? ''}`,
      );
    }

    // Filas completas
    const branches = await pool.query('SELECT * FROM branches ORDER BY id');
    console.log(`\nBranches detalle (${branches.rowCount}):`);
    for (const b of branches.rows) {
      console.log(
        JSON.stringify({
          ...b,
          created_at: String(b.created_at).slice(0, 19),
          updated_at: String(b.updated_at).slice(0, 19),
        }),
      );
    }

    // Tablas relacionadas
    const tables = [
      'delivery_zones',
      'delivery_time_slots',
      'user_branches',
      'carts',
      'orders',
      'inventory',
      'order_items',
    ];
    for (const t of tables) {
      try {
        const r = await pool.query(`SELECT COUNT(*) AS c FROM ${t}`);
        console.log(`${t}: ${r.rows[0].c}`);
      } catch (e) {
        console.log(`${t}: ERROR ${(e as Error).message.slice(0, 80)}`);
      }
    }

    const seq = await pool
      .query(`SELECT last_value FROM branches_id_seq`)
      .catch(() => null);
    if (seq)
      console.log(`branches_id_seq.last_value = ${seq.rows[0].last_value}`);

    try {
      const stores = await pool.query('SELECT id, name FROM store ORDER BY id');
      console.log(`Store (${stores.rowCount}):`);
      for (const s of stores.rows) console.log(`  id=${s.id} name=${s.name}`);
    } catch {
      const stores = await pool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE '%store%'",
      );
      console.log(
        'Tablas con store:',
        stores.rows.map((r: any) => r.table_name).join(', '),
      );
    }
  } finally {
    await pool.end();
  }
}

async function main() {
  const local = process.env.LOCAL_DATABASE_URL;
  const prod = process.env.PROD_DATABASE_URL;
  if (!local || !prod) {
    console.error('❌ LOCAL_DATABASE_URL / PROD_DATABASE_URL no definidas');
    process.exit(1);
  }
  await inspect(local, 'LOCAL');
  await inspect(prod, 'PRODUCCIÓN');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
