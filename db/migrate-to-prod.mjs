#!/usr/bin/env node
/**
 * Migrate local DB → producción (Railway)
 *
 * Uso:
 *   node migrate-to-prod.mjs              # con confirmación interactiva
 *   node migrate-to-prod.mjs --yes        # sin confirmar
 *
 * Variables de entorno (todas opcionales):
 *   PROD_DATABASE_URL  URL completa de producción (postgresql://user:pass@host:port/db)
 *   LOCAL_DB_CONTAINER Nombre del contenedor Docker local (default: ecommerce_postgres)
 *   LOCAL_DB_NAME      Nombre de la BD local (default: ecommerce)
 *   PROD_PG_IMAGE      Imagen con cliente pg para producción (default: postgres:18)
 *   MIGRATE_IGNORE_ERRORS=1  no abortar si el restore devuelve errores (extensiones postgis, etc.)
 */
import { spawnSync } from "node:child_process";
import { openSync, closeSync, statSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROD_URL = process.env.PROD_DATABASE_URL || "";
const LOCAL_CONTAINER = process.env.LOCAL_DB_CONTAINER || "ecommerce_postgres";
const LOCAL_DB = process.env.LOCAL_DB_NAME || "ecommerce";
const PROD_PG_IMAGE = process.env.PROD_PG_IMAGE || "postgres:18";
const IGNORE_ERRORS = process.env.MIGRATE_IGNORE_ERRORS === "1";
const CONFIRM = !process.argv.includes("--yes");

const TS = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

if (!PROD_URL) {
  fail(
    "Define PROD_DATABASE_URL (postgresql://user:pass@host:port/db) o edita el script con la URL de producción",
  );
}

const url = new URL(PROD_URL);
const PROD_PASSWORD = decodeURIComponent(url.password || "");
const PROD_HOST = url.hostname;
const PROD_PORT = url.port || "5432";
const PROD_DB = url.pathname.slice(1);
const PROD_USER = url.username || "postgres";

const DB_DIR = join(__dirname);

function run(cmd, args, { stdio = "inherit", env = {}, inputFile } = {}) {
  const opts = { stdio, env: { ...process.env, ...env } };
  if (inputFile) opts.stdio = [openSync(inputFile, "r"), "inherit", "inherit"];
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, opts);
  if (inputFile) closeSync(opts.stdio[0]);
  if (r.status !== 0 && !IGNORE_ERRORS) {
    fail(`El comando falló: ${cmd} ${args.join(" ")}`);
  }
  return r.status === 0;
}

function dumpTo(outFile, cmd, args, env) {
  const fd = openSync(outFile, "w");
  const r = spawnSync(cmd, args, {
    stdio: ["ignore", fd, "inherit"],
    env: { ...process.env, ...env },
  });
  closeSync(fd);
  if (r.status !== 0 && !IGNORE_ERRORS) {
    fail(`Falló el dump hacia ${outFile}`);
  }
  console.log(`✓ ${outFile} (${(statSync(outFile).size / 1024).toFixed(0)} KB)`);
}

async function confirm(msg) {
  if (!CONFIRM) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => rl.question(`\n⚠  ${msg} (s/N) `, resolve));
  rl.close();
  return answer.trim().toLowerCase() === "s";
}

async function main() {
  console.log("━━━ Migración Local → Producción ━━━");
  console.log(`Local : ${LOCAL_CONTAINER} / ${LOCAL_DB}`);
  console.log(`Producción: ${PROD_USER}@${PROD_HOST}:${PROD_PORT}/${PROD_DB}`);

  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

  // 1. Dump local
  const localFile = join(DB_DIR, `ecommerce_local_${TS}.backup`);
  console.log("\n[1/4] Volcando base LOCAL...");
  run("docker", ["exec", LOCAL_CONTAINER, "pg_dump", "-U", "postgres", "-d", LOCAL_DB, "--no-owner", "--no-privileges", "-F", "c", "-f", "/tmp/local_migrate.backup"]);
  run("docker", ["cp", `${LOCAL_CONTAINER}:/tmp/local_migrate.backup`, localFile]);
  console.log(`✓ ${localFile} (${(statSync(localFile).size / 1024).toFixed(0)} KB)`);

  // 2. Backup de seguridad de producción
  const prodFile = join(DB_DIR, `ecommerce_prod_before_${TS}.backup`);
  console.log("\n[2/4] Backup de seguridad de PRODUCCIÓN...");
  dumpTo(prodFile, "docker", [
    "run", "--rm",
    "-e", `PGPASSWORD=${PROD_PASSWORD}`,
    PROD_PG_IMAGE,
    "pg_dump", "-U", PROD_USER, "-h", PROD_HOST, "-p", PROD_PORT, "-d", PROD_DB,
    "--no-owner", "--no-privileges", "-F", "c",
  ]);

  // 3. Restore local → producción (DESTRUCTIVO)
  if (!(await confirm("Esto REEMPLAZARÁ la base de PRODUCCIÓN con la local. ¿Continuar?"))) {
    console.log("\nCancelado. No se modificó producción.");
    process.exit(0);
  }
  console.log("\n[3/4] Restaurando backup local en PRODUCCIÓN...");
  run(
    "docker",
    ["run", "--rm", "-i", "-e", `PGPASSWORD=${PROD_PASSWORD}`, PROD_PG_IMAGE, "pg_restore", "-U", PROD_USER, "-h", PROD_HOST, "-p", PROD_PORT, "-d", PROD_DB, "--clean", "--if-exists", "--no-owner", "--no-privileges"],
    { inputFile: localFile, env: { PGPASSWORD: PROD_PASSWORD } },
  );

  // 4. Verificación de conteos
  console.log("\n[4/4] Verificando conteos Local vs Producción...");
  const tables = [
    "products", "product_variants", "categories", "brands", "customers",
    "orders", "media", "promotions", "banners", "popups", "newsletter_subscribers",
  ];
  const q = tables.map((t) => `SELECT '${t}', count(*) FROM ${t}`).join(" UNION ALL ");
  const localOut = spawnSync("docker", ["exec", LOCAL_CONTAINER, "psql", "-U", "postgres", "-d", LOCAL_DB, "-t", "-c", q], { encoding: "utf8" });
  const prodOut = spawnSync("docker", ["run", "--rm", "-e", `PGPASSWORD=${PROD_PASSWORD}`, PROD_PG_IMAGE, "psql", "-U", PROD_USER, "-h", PROD_HOST, "-p", PROD_PORT, "-d", PROD_DB, "-t", "-c", q], { encoding: "utf8" });

  const parse = (out) => new Map((out.stdout || "").split("\n").filter(Boolean).map((l) => {
    const [t, c] = l.split("|").map((s) => s.trim());
    return [t, c];
  }));

  const localMap = parse(localOut);
  const prodMap = parse(prodOut);
  console.log("\nTabla                      Local       Producción   Estado");
  let ok = true;
  for (const t of tables) {
    const l = localMap.get(t) ?? "?";
    const p = prodMap.get(t) ?? "?";
    const match = l === p;
    if (!match) ok = false;
    console.log(`  ${t.padEnd(22)}  ${l.padStart(8)}  ${p.padStart(10)}   ${match ? "✓" : "✗ DIFERENCIA"}`);
  }
  console.log(ok ? "\n✅ Producción idéntica a local." : "\n⚠ Hay diferencias, revisa las tablas marcadas.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
