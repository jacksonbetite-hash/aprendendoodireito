#!/bin/sh
set -e
# Aplica migrações pendentes antes de servir. É idempotente: cada arquivo
# roda uma vez só, registrado em schema_migracao.
if [ "${RODAR_MIGRACOES:-1}" = "1" ]; then
  node scripts/migrate.mjs
fi

# Primeira subida: traz o acervo do vade-mécum (§5.4) do Planalto. Só uma vez
# — depois disso o banco já tem as normas e o comando sai na hora. A falha
# não derruba o site: sem rede, a instalação continua e `npm run leis` fecha
# a lacuna quando houver conexão.
if [ "${IMPORTAR_LEIS:-1}" = "1" ]; then
  node scripts/importar-leis.mjs --se-necessario || echo "aviso: acervo do vade-mécum não importado — rode 'npm run leis' quando houver rede"
fi

exec "$@"
