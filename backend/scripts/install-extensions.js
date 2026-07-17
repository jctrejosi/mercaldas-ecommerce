const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:HfjAUDntotHlsunYlOgANrepsoRMSziS@tokaido.proxy.rlwy.net:12512/railway';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function installExtensions() {
  console.log('🔧 Instalando extensiones necesarias...');
  
  try {
    // 1. Instalar uuid-ossp
    console.log('📦 Instalando uuid-ossp...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ UUID-OSSP instalado correctamente');
    
    // 2. Verificar instalación
    const result = await pool.query('SELECT uuid_generate_v4()');
    console.log('✅ UUID funcionando:', result.rows[0].uuid_generate_v4);
    
    console.log('🎉 Extensiones instaladas exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

installExtensions();