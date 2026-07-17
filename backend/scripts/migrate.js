const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🔄 Ejecutando generate + push...');
  
  try {
    // 1️⃣ PRIMERO: Generar la migración
    console.log('📝 Generando archivos de migración...');
    const { stdout: genStdout, stderr: genStderr } = await execAsync('yarn db:generate');
    
    if (genStdout) {
      console.log('✅ Migración generada:', genStdout);
    }
    if (genStderr) {
      console.warn('⚠️ Advertencias de generación:', genStderr);
    }

    // 2️⃣ LUEGO: Aplicar la migración con push --force
    console.log('🔄 Aplicando migraciones con push --force...');
    const { stdout: pushStdout, stderr: pushStderr } = await execAsync('yarn db:push --force');
    
    if (pushStdout) {
      console.log('✅ Migraciones aplicadas:', pushStdout);
    }
    if (pushStderr) {
      console.warn('⚠️ Advertencias de aplicación:', pushStderr);
    }

    console.log('✅ Proceso completado exitosamente');
    
  } catch (error) {
    console.log('⚠️ Error en el proceso (ignorado):', error.message);
  }
  
  process.exit(0);
}

runMigrations();