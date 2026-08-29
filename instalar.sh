#!/usr/bin/env bash
# Aprendendo o Direito — instalação local (macOS e Linux).
# Equivalente ao instalar.ps1. Uso: ./instalar.sh
set -euo pipefail
cd "$(dirname "$0")"

passo() { printf '\n==> %s\n' "$1"; }

passo 'Conferindo o Docker'
docker version --format '{{.Server.Version}}' >/dev/null 2>&1 || {
  echo "    O Docker não respondeu. Instale o Docker Desktop e deixe-o rodando." >&2
  exit 1
}

passo 'Construindo a imagem (a primeira vez leva alguns minutos)'
docker compose build

passo 'Subindo banco e aplicação'
docker compose up -d

passo 'Esperando a aplicação responder'
for _ in $(seq 1 60); do
  curl -sf http://localhost:3000/ >/dev/null && break
  sleep 2
done
curl -sf http://localhost:3000/ >/dev/null || {
  echo "    Não respondeu a tempo. Veja: docker compose logs -f web" >&2; exit 1;
}

passo 'Criando o administrador'
if [ "$(docker compose exec -T db psql -U aprendendo -d aprendendoodireito -t -A -c "SELECT count(*) FROM usuario WHERE papel='admin'" | tr -d '[:space:]')" = "0" ]; then
  if [ ! -t 0 ]; then
    # sem terminal interativo (CI, pipe): não trava pedindo dados
    echo '    Sem terminal interativo. Crie o admin depois com:'
    echo '      docker compose exec web node scripts/criar-admin.mjs email@exemplo.com "Nome"'
    email=''; nome=''
  else
    read -rp 'E-mail do administrador: ' email
    read -rp 'Nome do administrador: ' nome
  fi
  if [ -n "$email" ] && [ -n "$nome" ]; then
    docker compose exec -T web node scripts/criar-admin.mjs "$email" "$nome"
    echo '    Anote a senha acima: ela não é mostrada de novo.'
  fi
else
  echo '    Já existe administrador.'
fi

cat <<TXT

  ============================================================
   Aprendendo o Direito está rodando

   Site e sistema .... http://localhost:3000
   Área do aluno ..... http://localhost:3000/painel
   Administração ..... http://localhost:3000/admin

   Conta de exemplo:   ana@exemplo.com / constitucional88

   Parar ............. docker compose down
  ============================================================

TXT
