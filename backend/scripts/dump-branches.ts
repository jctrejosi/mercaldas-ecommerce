/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Pool } from 'pg';

async function main() {
  const local = process.env.LOCAL_DATABASE_URL;
  if (!local) {
    console.error('❌ LOCAL_DATABASE_URL no definida');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: local });
  try {
    const movements = await pool.query('SELECT COUNT(*) AS c FROM inventory_movements');
    const reservations = await pool.query(
      'SELECT COUNT(*) AS c FROM inventory_reservations',
    );
    const sample = await pool.query(
      'SELECT id, product_variant_id, branch_id, stock FROM inventory LIMIT 5',
    );
    console.log('inventory_movements:', movements.rows[0].c);
    console.log('inventory_reservations:', reservations.rows[0].c);
    console.log('inventory sample:', JSON.stringify(sample.rows));

    const branches = await pool.query(
      'SELECT id, code, name, address, city, phone, store_id, email, priority, manager_name, manager_phone, max_daily_orders, branch_type, location, delivery_radius_km, schedule, is_active, created_at, updated_at, deleted_at FROM branches ORDER BY id',
    );
    console.log('branches full:', JSON.stringify(branches.rows, null, 1));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
