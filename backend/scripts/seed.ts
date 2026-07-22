// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log('🌱 Insertando datos base (usuarios, tienda, sucursal)...');

  try {
    // 1. Store (requerido por branches)
    console.log('📦 Insertando store...');
    await db.execute(sql`
      INSERT INTO store (id, status, legal_name, trade_name, tax_id, tax_regime, business_name,
        invoice_provider, invoice_prefix, supported_languages, supported_currencies,
        email, phone, primary_domain, address, currency_code, language, timezone)
      VALUES (1, 'ACTIVE', 'Mercaldas S.A.S.', 'Mercaldas', '890800427-3', 'RESPONSABLE_IVA',
        'Mercaldas S.A.S.', 'LOCAL', 'FAC-', '["es"]', '["COP"]',
        'servicio@mercaldas.com.co', '(606) 890-1234', 'mercaldas.com.co',
        'Cra 23 # 64-60, Barrio Milán, Manizales',
        'COP', 'es', 'America/Bogota')
      ON CONFLICT (id) DO NOTHING
    `);

    // 2. Admin user (con password hasheada con bcrypt)
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    console.log('📦 Creando usuario admin...');
    await db.execute(sql`
      INSERT INTO users (id, email, username, password_hash, first_name, last_name, phone, is_superuser, is_active)
      VALUES (1, 'admin@mercaldas.com.co', 'admin', ${passwordHash}, 'Admin', 'Mercaldas', '3001234567', true, true)
      ON CONFLICT (id) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email,
        updated_at = NOW()
    `);

    // 3. Customer de prueba
    const customerPassword = process.env.CUSTOMER_PASSWORD || 'cliente123';
    const customerPasswordHash = await bcrypt.hash(customerPassword, 10);

    console.log('📦 Creando customer de prueba...');
    await db.execute(sql`
      INSERT INTO customers (email, password_hash, first_name, last_name, phone,
        customer_type, is_active, accepts_marketing)
      VALUES ('cliente@mercaldas.com.co', ${customerPasswordHash}, 'Carlos', 'Ríos',
        '3007654321', 'registered', true, false)
      ON CONFLICT (email) DO NOTHING
    `);

    // 4. Branch (sucursal principal)
    console.log('📦 Insertando sucursal...');
    await db.execute(sql`
      INSERT INTO branches (id, code, name, address, city, phone, store_id, email,
        manager_name, manager_phone, priority, branch_type,
        location, delivery_radius_km, schedule, is_active)
      VALUES (1, 'SUC-001', 'Mercaldas Milán',
        'Cra 23 # 64-60, Barrio Milán', 'Manizales',
        '(606) 890-1001', 1, 'milan@mercaldas.com.co',
        'Carlos Gómez', '3001234567', 1, 'STORE',
        'POINT(-75.5197 5.0646)', 10.0,
        '{"monday":"06:00-22:00","tuesday":"06:00-22:00","wednesday":"06:00-22:00","thursday":"06:00-22:00","friday":"06:00-22:00","saturday":"06:00-20:00","sunday":"08:00-18:00"}',
        true)
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✅ Seed base completado exitosamente');
    console.log('   👤 Admin: admin@mercaldas.com.co');
    console.log('   👤 Cliente: cliente@mercaldas.com.co');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

void seed();
