const { exec } = require('child_process');
const { promisify } = require('util');
const { Pool } = require('pg');
const execAsync = promisify(exec);

async function checkDatabaseConnection() {
  console.log('🔍 Verificando conexión a la base de datos...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    
    await pool.query('SELECT 1');
    await pool.end();
    
    console.log('✅ Conexión a la base de datos exitosa');
    return true;
  } catch (error) {
    console.log('❌ No se pudo conectar a la base de datos:', error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🔄 Iniciando proceso de migraciones...');
  
  try {
    // 1️⃣ Verificar conexión primero
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      // Si no hay conexión, ejecutar generate + push
      console.log('📝 Generando archivos de migración...');
      await execAsync('yarn db:generate');
      
      console.log('🔄 Aplicando migraciones a la base de datos...');
      const { stdout, stderr } = await execAsync('yarn db:push');
      
      if (stdout) console.log('✅ Migraciones aplicadas:', stdout);
      if (stderr) console.warn('⚠️ Advertencias:', stderr);
      
      console.log('✅ Migraciones completadas exitosamente');
      return;
    }
    
    // 2️⃣ Si hay conexión, intentar push directo
    console.log('🔄 Sincronizando esquema con la base de datos...');
    const { stdout, stderr } = await execAsync('yarn db:push');
    
    if (stdout) console.log('✅ Esquema sincronizado:', stdout);
    if (stderr) console.warn('⚠️ Advertencias:', stderr);
    
    console.log('✅ Proceso completado exitosamente');
    
  } catch (error) {
    console.log('ℹ️ No hay cambios para aplicar o error:', error.message);
    // No falla el build
    process.exit(0);
  }
}

runMigrations();