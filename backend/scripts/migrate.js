const { exec } = require('child_process');
const { promisify } = require('util');
const { Pool } = require('pg');
const execAsync = promisify(exec);

async function checkDatabaseTables() {
  console.log('🔍 Verificando tablas en la base de datos...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    
    const result = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    await pool.end();
    
    const tableCount = parseInt(result.rows[0].count);
    console.log(`📊 Tablas encontradas: ${tableCount}`);
    
    return tableCount > 0;
  } catch (error) {
    console.log('❌ Error verificando tablas:', error.message);
    return false;
  }
}

async function runMigrations() {
  console.log('🔄 Iniciando proceso de migraciones...');
  
  try {
    // 1️⃣ Verificar si hay tablas
    const hasTables = await checkDatabaseTables();
    
    if (!hasTables) {
      // Si no hay tablas, ejecutar generate + push para crear todo
      console.log('📝 Base de datos vacía. Generando migración inicial...');
      const { stdout: genStdout, stderr: genStderr } = await execAsync('yarn db:generate');
      
      if (genStdout) console.log('✅ Migración generada:', genStdout);
      if (genStderr) console.warn('⚠️ Advertencias de generación:', genStderr);
      
      console.log('🔄 Creando tablas en la base de datos...');
      const { stdout: pushStdout, stderr: pushStderr } = await execAsync('yarn db:push');
      
      if (pushStdout) console.log('✅ Tablas creadas:', pushStdout);
      if (pushStderr) console.warn('⚠️ Advertencias:', pushStderr);
      
      console.log('✅ Base de datos inicializada exitosamente');
      return;
    }
    
    // 2️⃣ Si hay tablas, solo sincronizar cambios
    console.log('🔄 Sincronizando cambios del esquema...');
    const { stdout, stderr } = await execAsync('yarn db:push');
    
    if (stdout) console.log('✅ Esquema sincronizado:', stdout);
    if (stderr) console.warn('⚠️ Advertencias:', stderr);
    
    console.log('✅ Proceso completado exitosamente');
    
  } catch (error) {
    console.log('⚠️ Error en el proceso:', error.message);
    // No falla el build
    process.exit(0);
  }
}

runMigrations();