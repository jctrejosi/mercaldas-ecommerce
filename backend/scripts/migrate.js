const { exec } = require('child_process');
const { promisify } = require('util');
const { Pool } = require('pg');

const execAsync = promisify(exec);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

async function tableExists(pool, tableName) {
  const result = await pool.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = $1
    )`,
    [tableName],
  );
  return result.rows[0]?.exists === true;
}

async function hasData(pool, tableName) {
  const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
  return parseInt(result.rows[0].count) > 0;
}

async function runCommand(command, label) {
  console.log(`🚀 ${label}...`);
  try {
    const { stdout, stderr } = await execAsync(command, {
      env: { ...process.env, DATABASE_URL },
    });
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    console.log(`✅ ${label} completado`);
  } catch (error) {
    console.error(`❌ ${label} falló:`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    throw error;
  }
}

async function migrate() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const productsTableExists = await tableExists(pool, 'products');

    if (!productsTableExists) {
      console.log('🆕 Base de datos nueva detectada. Ejecutando migración completa...');
      await runCommand('yarn db:push', 'Creación de tablas (db:push)');
      await runCommand('yarn seed:run', 'Seed de usuarios (seed:run)');
      await runCommand('yarn import:run', 'Importación de productos (import:run)');
    } else {
      const hasProductData = await hasData(pool, 'products');

      if (!hasProductData) {
        console.log('📋 Tabla products existe pero está vacía. Ejecutando seed + import...');
        await runCommand('yarn seed:run', 'Seed de usuarios (seed:run)');
        await runCommand('yarn import:run', 'Importación de productos (import:run)');
      } else {
        console.log('♻️ Base de datos existente con productos. Solo actualizando esquema...');
        await runCommand('yarn db:push', 'Actualización de esquema (db:push)');
      }
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
  } finally {
    await pool.end();
  }
}

migrate().then(() => process.exit(0));
