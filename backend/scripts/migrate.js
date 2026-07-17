const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🔄 Ejecutando migraciones en producción...');
  
  try {
    // 1️⃣ Generar la migración
    console.log('📝 Generando archivos de migración...');
    const { stdout: genStdout, stderr: genStderr } = await execAsync('yarn db:generate');
    
    if (genStdout) console.log('✅ Migración generada:', genStdout);
    if (genStderr) console.warn('⚠️ Advertencias de generación:', genStderr);

    // 2️⃣ Aplicar la migración
    console.log('🔄 Aplicando migraciones a la base de datos...');
    const { stdout: pushStdout, stderr: pushStderr } = await execAsync('yarn db:push');

    if (pushStdout) console.log('✅ Migraciones aplicadas:', pushStdout);
    if (pushStderr) console.warn('⚠️ Advertencias de aplicación:', pushStderr);

    console.log('✅ Migraciones completadas exitosamente');
  } catch (error) {
    console.error('❌ Error en migraciones:', error);
    process.exit(1);
  }
}

runMigrations();