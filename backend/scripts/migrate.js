const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🔄 Ejecutando db:push --force...');
  
  try {
    const { stdout, stderr } = await execAsync('yarn db:push --force');
    
    if (stdout) {
      console.log('✅ db:push ejecutado correctamente:', stdout);
    }
    if (stderr) {
      console.warn('⚠️ Advertencias:', stderr);
    }
    
    console.log('✅ Migraciones completadas exitosamente');
    
  } catch (error) {
    console.log('⚠️ Error en db:push (ignorado):', error.message);
  }
  
  process.exit(0);
}

runMigrations();