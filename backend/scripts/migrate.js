const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runMigrations() {
  console.log('🔄 Sincronizando esquema con la base de datos...');
  try {
    const { stdout, stderr } = await execAsync('yarn db:push');
    if (stdout) console.log('✅ Esquema sincronizado:', stdout);
    if (stderr) console.warn('⚠️ Advertencias:', stderr);
  } catch (error) {
    console.log('ℹ️ No hay cambios para aplicar o error:', error.message);
    // No falla el build
    process.exit(0);
  }
}

runMigrations();