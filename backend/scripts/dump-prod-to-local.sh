#!/usr/bin/env bash
# =============================================================================
# Script: dump-prod-to-local.sh
# Descripción: Vuelca los datos de la BD de producción y los restaura en local.
#
# Uso:
#   1. Asegúrate de tener configuradas las URLs en los .env:
#      - backend/.env.production.local  → DATABASE_URL (producción)
#      - backend/.env.development.local → DATABASE_URL (local)
#   2. Ejecuta: bash scripts/dump-prod-to-local.sh
#
# Requisitos: pg_dump, psql (vienen con postgresql-client)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# --- Cargar variables de entorno desde los archivos .env ---
# dotenvx / dotenv no están disponibles como binario directo,
# así que hacemos un parseo simple de los .env

parse_env_file() {
  local file="$1"
  while IFS='=' read -r key value; do
    # Ignorar líneas vacías y comentarios
    [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
    # Limpiar espacios y comillas
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs | sed 's/^"//;s/"$//;s/^'\''//;s/'\''$//')
    export "$key=$value"
  done < "$file"
}

ENV_PROD="$BACKEND_DIR/.env.production.local"
ENV_DEV="$BACKEND_DIR/.env.development.local"

if [[ ! -f "$ENV_PROD" ]]; then
  echo "❌ No se encontró $ENV_PROD"
  exit 1
fi
if [[ ! -f "$ENV_DEV" ]]; then
  echo "❌ No se encontró $ENV_DEV"
  exit 1
fi

# Cargar variables (primero dev, luego prod para que prod tenga prioridad si hay conflicto)
parse_env_file "$ENV_DEV"
PROD_DB_URL="$(grep '^DATABASE_URL=' "$ENV_PROD" | head -1 | cut -d'=' -f2- | xargs | sed 's/^"//;s/"$//;s/^'\''//;s/'\''$//')"
LOCAL_DB_URL="${DATABASE_URL:-}"

if [[ -z "$PROD_DB_URL" || "$PROD_DB_URL" == *"user:password@host"* ]]; then
  echo "❌ La DATABASE_URL de producción en $ENV_PROD es un placeholder."
  echo "   Edita el archivo y coloca la URL real de la base de datos de producción."
  exit 1
fi

if [[ -z "$LOCAL_DB_URL" ]]; then
  echo "❌ La DATABASE_URL local no está definida en $ENV_DEV"
  exit 1
fi

# --- Configuración ---
DUMP_FILE="$BACKEND_DIR/data/prod_dump_$(date +%Y%m%d_%H%M%S).sql"
EXCLUDED_TABLES=(
  "spatial_ref_sys"
  "geography_columns"
  "geometry_columns"
)

echo "════════════════════════════════════════════════════════"
echo "  DUMP DE PRODUCCIÓN → LOCAL"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📍 Origen:  ${PROD_DB_URL//@*/@***}"   # ocultar credenciales
echo "📍 Destino: ${LOCAL_DB_URL//@*/@***}"
echo "📁 Dump:    $DUMP_FILE"
echo ""

# --- Paso 1: Dumpear datos de producción ---
echo "📦 [1/4] Volcando datos de producción..."
BUILD_EXCLUDE=""
for table in "${EXCLUDED_TABLES[@]}"; do
  BUILD_EXCLUDE="$BUILD_EXCLUDE --exclude-table-data=$table"
done

# shellcheck disable=SC2086
pg_dump \
  --dbname="$PROD_DB_URL" \
  --data-only \
  --no-owner \
  --no-acl \
  --inserts \
  --on-conflict-do-nothing \
  $BUILD_EXCLUDE \
  --file="$DUMP_FILE"

echo "   ✅ Dump guardado en $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"

# --- Paso 2: Limpiar tablas locales ---
echo ""
echo "🧹 [2/4] Limpiando tablas locales..."

# Generar lista de tablas a limpiar (en orden inverso de dependencia con CASCADE)
CLEANUP_SQL=$(cat <<'SQL'
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Deshabilitar temporalmente las restricciones de FK
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')) LOOP
    EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' DISABLE TRIGGER ALL';
  END LOOP;

  -- Truncar todas las tablas en orden
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')) LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;

  -- Reactivar triggers
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')) LOOP
    EXECUTE 'ALTER TABLE ' || quote_ident(r.tablename) || ' ENABLE TRIGGER ALL';
  END LOOP;
END $$;
SQL
)

echo "$CLEANUP_SQL" | psql "$LOCAL_DB_URL" --quiet
echo "   ✅ Tablas limpiadas"

# --- Paso 3: Restaurar datos en local ---
echo ""
echo "📥 [3/4] Restaurando datos en local..."
psql "$LOCAL_DB_URL" --file="$DUMP_FILE" --quiet
echo "   ✅ Datos restaurados"

# --- Paso 4: Reiniciar secuencias ---
echo ""
echo "🔄 [4/4] Reiniciando secuencias..."
SEQUENCE_SQL=$(cat <<'SQL'
DO $$
DECLARE
  r RECORD;
  seq_name TEXT;
  tab_name TEXT;
  col_name TEXT;
  max_val BIGINT;
BEGIN
  FOR r IN
    SELECT
      s.relname AS sequence_name,
      t.relname AS table_name,
      a.attname AS column_name
    FROM pg_class s
    JOIN pg_depend d ON d.objid = s.oid
    JOIN pg_class t ON d.refobjid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
    WHERE s.relkind = 'S'
      AND s.relnamespace = 'public'::regnamespace
  LOOP
    seq_name := quote_ident(r.sequence_name);
    tab_name := quote_ident(r.table_name);
    col_name := quote_ident(r.column_name);
    EXECUTE format('SELECT COALESCE(MAX(%s), 1) FROM %s', col_name, tab_name) INTO max_val;
    EXECUTE format('ALTER SEQUENCE %s RESTART WITH %s', seq_name, max_val + 1);
  END LOOP;
END $$;
SQL
)

echo "$SEQUENCE_SQL" | psql "$LOCAL_DB_URL" --quiet
echo "   ✅ Secuencias reiniciadas"

# --- Resumen ---
echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅ DUMP COMPLETADO EXITOSAMENTE"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📁 El dump se guardó en: $DUMP_FILE"
echo ""
echo "⚠️  Notas importantes:"
echo "   - Las contraseñas de usuarios/clientes de producción"
echo "     se mantienen (hasheadas con bcrypt)."
echo "   - Si necesitas resetear la contraseña del admin local,"
echo "     ejecuta:  yarn seed:run"
echo "   - Para borrar el dump después: rm $DUMP_FILE"
