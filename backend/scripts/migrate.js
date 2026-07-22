const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 2 });

function runCommand(command, label) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 ${label}...`);
    const child = exec(command, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL },
    });
    child.stdout.on('data', (d) => process.stdout.write(d));
    child.stderr.on('data', (d) => process.stderr.write(d));
    child.on('close', (code) => {
      if (code === 0) { console.log(`✅ ${label}`); resolve(); }
      else { console.error(`❌ ${label} (código ${code})`); reject(new Error(`${label} salió con ${code}`)); }
    });
  });
}

async function tableExists(client, tableName) {
  const r = await client.query(
    `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)`,
    [tableName],
  );
  return r.rows[0]?.exists === true;
}

function splitSQL(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (inString) {
      current += ch;
      if (ch === stringChar && sql[i - 1] !== '\\') inString = false;
    } else if (ch === "'" || ch === '"') {
      current += ch;
      inString = true;
      stringChar = ch;
    } else if (ch === ';') {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = '';
    } else {
      current += ch;
    }
    i++;
  }

  const last = current.trim();
  if (last) statements.push(last);
  return statements;
}

async function applyMigrations(client) {
  const migrateDir = path.join(__dirname, '..', 'drizzle', 'migrate');
  if (!fs.existsSync(migrateDir)) {
    console.log('⚠️ No existe directorio drizzle/migrate');
    return;
  }

  const files = fs.readdirSync(migrateDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️ No se encontraron archivos .sql');
    return;
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      hash text PRIMARY KEY,
      created_at timestamptz DEFAULT now()
    )
  `);

  const { rows: applied } = await client.query('SELECT hash FROM drizzle.__drizzle_migrations');
  const appliedHashes = new Set(applied.map(r => r.hash));

  for (const file of files) {
    const filePath = path.join(migrateDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');

    if (appliedHashes.has(hash)) {
      console.log(`⏭️ ${file} (ya aplicado)`);
      continue;
    }

    console.log(`📄 Aplicando ${file}...`);
    const statements = splitSQL(content);

    for (const stmt of statements) {
      try {
        await client.query(stmt);
      } catch (err) {
        if (err.code === '42P07' || err.code === '42P16' || err.code === '42710') {
          console.log(`   ⚠️ Ya existe: ${stmt.substring(0, 60)}...`);
          continue;
        }
        throw err;
      }
    }

    await client.query('INSERT INTO drizzle.__drizzle_migrations (hash) VALUES ($1)', [hash]);
    console.log(`✅ ${file} aplicado`);
  }
}

async function migrate() {
  let client;
  try {
    // 0. Instalar extensiones de PostgreSQL (uuid-ossp)
    await runCommand('node scripts/install-extensions.js', 'Extensiones PG');

    client = await pool.connect();
    const exists = await tableExists(client, 'products');

    if (!exists) {
      console.log('🆕 BD nueva. Ejecutando migración completa...');

      await runCommand('yarn db:generate', 'db:generate');
      await applyMigrations(client);

      const ok = await tableExists(client, 'store');
      if (!ok) throw new Error('Las tablas no se crearon.');

      client.release(); client = null;

      await runCommand('yarn seed:run', 'seed:run');
      await runCommand('yarn import:run', 'import:run');
    } else {
      console.log('♻️ BD existente. Actualizando esquema...');
      await runCommand('yarn db:generate', 'db:generate');
      await applyMigrations(client);
    }

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error fatal en migración:', error.message);
    process.exit(1);
  } finally {
    try { if (client) client.release(); } catch {}
    await pool.end();
  }
}

migrate();
