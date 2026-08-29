#!/bin/sh
set -e
# Aplica migrações pendentes antes de servir. É idempotente: cada arquivo
# roda uma vez só, registrado em schema_migracao.
if [ "${RODAR_MIGRACOES:-1}" = "1" ]; then
  node scripts/migrate.mjs
fi
exec "$@"
