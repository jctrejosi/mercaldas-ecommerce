const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

function runCommand(command, label) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 ${label}...`);
    const child = exec(command, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL },
    });

    child.stdout.on('data', (data) => process.stdout.write(data));
    child.stderr.on('data', (data) => process.stderr.write(data));

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${label} completado`);
        resolve();
      } else {
        console.error(`❌ ${label} falló con código ${code}`);
        reject(new Error(`${label} salió con código ${code}`));
      }
    });
  });
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    )`,
    [tableName],
  );
  return result.rows[0]?.exists === true;
}

async function migrate() {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const client = await pool.connect();
    const productsTableExists = await tableExists(client, 'products');
    client.release();

    if (!productsTableExists) {
      console.log('🆕 BD nueva. Ejecutando migración completa...');

      // 1. Crear tablas
      await runCommand('yarn db:push', 'db:push (crear tablas)');

      // Verificar que las tablas se crearon
      const verifyClient = await pool.connect();
      const storeExists = await tableExists(verifyClient, 'store');
      verifyClient.release();

      if (!storeExists) {
        throw new Error(
          'db:push no creó las tablas. Verifica DATABASE_URL y la conexión a PostgreSQL.'
        );
      }
      console.log('✅ Tablas verificadas (store existe)');

      // 2. Seed de usuarios
      await runCommand('yarn seed:run', 'seed:run (usuarios)');

      // 3. Importar productos
      await runCommand('yarn import:run', 'import:run (productos)');
    } else {
      console.log('♻️ BD existente con productos. Solo actualizando esquema...');
      await runCommand('yarn db:push', 'db:push (actualizar esquema)');
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error fatal en migración:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
