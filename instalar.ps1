<#
  Aprendendo o Direito — instalação local (Windows)

  Sobe o sistema completo na sua máquina com Docker Desktop:
  banco PostgreSQL, migrações, catálogo populado e a aplicação no ar.

  Uso, no PowerShell, dentro da pasta do projeto:
      .\instalar.ps1

  Se o PowerShell recusar por política de execução, rode uma vez:
      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#>

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $raiz

function Passo($texto) { Write-Host "`n==> $texto" -ForegroundColor Cyan }
function Ok($texto)    { Write-Host "    $texto" -ForegroundColor Green }
function Aviso($texto) { Write-Host "    $texto" -ForegroundColor Yellow }

Passo 'Conferindo o Docker'
try {
  docker version --format '{{.Server.Version}}' | Out-Null
  Ok 'Docker respondendo.'
} catch {
  Write-Host @"
    O Docker nao respondeu.

    1. Instale o Docker Desktop: https://www.docker.com/products/docker-desktop/
    2. Abra o Docker Desktop e espere ficar "Engine running".
    3. Rode este script de novo.
"@ -ForegroundColor Red
  exit 1
}

Passo 'Verificando a porta 3000'
$emUso = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($emUso) {
  Aviso 'A porta 3000 ja esta em uso. Feche o programa que a ocupa ou edite docker-compose.yml.'
}

Passo 'Construindo a imagem (a primeira vez leva alguns minutos)'
docker compose build
if ($LASTEXITCODE -ne 0) { throw 'A construcao da imagem falhou.' }
Ok 'Imagem pronta.'

Passo 'Subindo banco e aplicacao'
docker compose up -d
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel subir os servicos.' }

Passo 'Esperando a aplicacao responder'
$pronto = $false
foreach ($i in 1..60) {
  try {
    $r = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $pronto = $true; break }
  } catch { Start-Sleep -Seconds 2 }
}
if (-not $pronto) {
  Write-Host '    A aplicacao nao respondeu a tempo. Veja os logs com: docker compose logs -f web' -ForegroundColor Red
  exit 1
}
Ok 'Aplicacao no ar.'

Passo 'Criando o administrador'
$existe = docker compose exec -T db psql -U aprendendo -d aprendendoodireito -t -A -c "SELECT count(*) FROM usuario WHERE papel='admin'"
if ($existe.Trim() -eq '0') {
  $email = Read-Host 'E-mail do administrador'
  $nome  = Read-Host 'Nome do administrador'
  if ($email -and $nome) {
    docker compose exec -T web node scripts/criar-admin.mjs $email "$nome"
    Aviso 'Anote a senha acima: ela nao e mostrada de novo.'
  } else {
    Aviso 'Pulado. Crie depois com:'
    Write-Host '      docker compose exec web node scripts/criar-admin.mjs email@exemplo.com "Nome"' -ForegroundColor Gray
  }
} else {
  Ok 'Ja existe administrador. Para criar outro:'
  Write-Host '      docker compose exec web node scripts/criar-admin.mjs email@exemplo.com "Nome"' -ForegroundColor Gray
}

Write-Host @"

  ============================================================
   Aprendendo o Direito esta rodando

   Site e sistema .... http://localhost:3000
   Area do aluno ..... http://localhost:3000/painel
   Administracao ..... http://localhost:3000/admin

   Conta de exemplo (dados de demonstracao):
     ana@exemplo.com / constitucional88

   Parar ............. docker compose down
   Parar e apagar .... docker compose down -v
   Ver logs .......... docker compose logs -f web
  ============================================================

"@ -ForegroundColor Green

Start-Process 'http://localhost:3000'
