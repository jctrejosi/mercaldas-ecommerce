#!/usr/bin/env bash
# Levanta los 3 servicios de MercAldas en local.
# Uso: ./dev-all.sh   (o: bash dev-all.sh)   —  Ctrl+C detiene todo.
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🌱 Levantando los 3 servicios de MercAldas..."
echo "   • backend        → http://localhost:3000  (yarn dev)"
echo "   • Interfaz web   → http://localhost:5173  (yarn dev)"
echo "   • Interfaz admin → http://localhost:8443  (yarn dev)"
echo "Pulsa Ctrl+C para detener todos."

if ! command -v concurrently >/dev/null 2>&1 && ! npx --no-install concurrently --version >/dev/null 2>&1; then
  echo ""
  echo "⚠️  'concurrently' no está instalado; usando modo básico (procesos en paralelo)."
  echo "    Para salida con prefijos por servicio: yarn add -D -W concurrently en la raíz."
  (cd "$ROOT/backend" && yarn dev) &
  (cd "$ROOT/Interfaz web" && yarn dev) &
  (cd "$ROOT/Interfaz admin web" && yarn dev) &
  trap 'echo "⏹  Deteniendo servicios..."; kill 0 2>/dev/null' INT TERM EXIT
  wait
  exit 0
fi

npx --yes concurrently -k -n BACKEND,WEB,ADMIN -c red,green,blue \
  "cd \"$ROOT/backend\" && yarn dev" \
  "cd \"$ROOT/Interfaz web\" && yarn dev" \
  "cd \"$ROOT/Interfaz admin web\" && yarn dev"
