const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function checkAndMigrate() {
  try {
    console.log('🔍 Verificando si la base de datos existe...');
    
    // Intentar conectar a la base de datos
    await execAsync('node -e "const { Pool } = require(\'pg\'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query(\'SELECT 1\').then(() => process.exit(0)).catch(() => process.exit(1));"');
    
    console.log('✅ Base de datos existe, omitiendo migraciones');
    process.exit(0);
  } catch (error) {
    console.log('🔄 Base de datos no encontrada, ejecutando migraciones...');
    
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

      // 2️⃣ LUEGO: Aplicar la migración
      console.log('🔄 Aplicando migraciones a la base de datos...');
      const { stdout: pushStdout, stderr: pushStderr } = await execAsync('yarn db:push');

      if (pushStdout) {
        console.log('✅ Migraciones aplicadas:', pushStdout);
      }
      if (pushStderr) {
        console.warn('⚠️ Advertencias de aplicación:', pushStderr);
      }

      console.log('✅ Migraciones completadas exitosamente');
      process.exit(0);
    } catch (migrationError) {
      console.error('❌ Error en migraciones:', migrationError);
      process.exit(1);
    }
  }
}

checkAndMigrate();