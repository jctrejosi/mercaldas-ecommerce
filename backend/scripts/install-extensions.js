const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });

async function installExtensions() {
  console.log('🔧 Instalando extensiones de PostgreSQL...');

  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ uuid-ossp instalado');

    // Verificar
    const r = await pool.query('SELECT uuid_generate_v4()');
    console.log(`✅ UUID generado: ${r.rows[0].uuid_generate_v4}`);
  } catch (error) {
    console.error('❌ Error instalando extensiones:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

installExtensions();
