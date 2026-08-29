# Aprendendo o Direito ⚖️

Plataforma de ensino jurídico descrita em [`discovery.md`](discovery.md) (v1.0,
29/08/2026). Este repositório é a implantação da **Fase 1 (MVP)** do roadmap §14.

> Entender Direito sem precisar decorar. Aula curta, linguagem de gente, a lei
> ao lado e um exercício no final para provar que você aprendeu.

## Instalar na sua máquina

**Windows:** siga [`INSTALAR-NO-WINDOWS.md`](INSTALAR-NO-WINDOWS.md) — clone,
Docker Desktop e `.\instalar.ps1`.

**macOS e Linux:** `./instalar.sh`

Ou, se preferir os comandos crus:

```bash
docker compose up -d --build
```

Abre em **http://localhost:3000**. O banco é criado, as migrações rodam pelo
entrypoint e o catálogo já vem populado. Para parar: `docker compose down`
(com `-v` para apagar também os dados).

Em rede corporativa com proxy que inspeciona TLS, passe a CA ao build:

```bash
docker build --secret id=ca_bundle,src=/caminho/ca.crt -t aprendendoodireito .
```

### Primeiro administrador

Não existe admin no seed — senha padrão em repositório é porta dos fundos.
Crie um explicitamente:

```bash
node scripts/criar-admin.mjs voce@exemplo.com "Seu Nome"
# imprime uma senha sorteada, uma única vez
```

Depois entre em `/entrar` e o menu de administração aparece.

### Desenvolvimento

```bash
docker compose up -d db                 # só o Postgres (publicado em 127.0.0.1:5432)
export DATABASE_URL=postgres://aprendendo:aprendendo@localhost:5432/aprendendoodireito
npm install && npm run migrate && npm run dev

npm test          # 42 testes: licenças, senha e preços
npm run contraste # 16 pares de cor contra o WCAG AA
SENHA_ADMIN=... npm run e2e   # 38 verificações no navegador, com a app de pé
```

O seed traz uma conta de exemplo (`ana@exemplo.com` / `constitucional88`) com
trial e licença promocional ativos, para o fluxo do aluno ser navegável na hora.

## O que já está implementado

| Área | Estado |
|---|---|
| **Taxonomia §4** | Área → Matéria → Assunto → Aula → Exercício no banco, com as 7 áreas e as 11 matérias do catálogo de partida |
| **Motor de licenças §6.3** | `lib/licenca.ts` — `podeAcessar` resolvendo escopo, origem, status, vigência e cota do trial. **29 testes** cobrem a matriz de 36 combinações (mitigação do risco §15.8) |
| **Camadas de acesso §6.1** | Aberta, trial com cota de conteúdo, licença por matéria, promocional e passe — todas somam, nunca se anulam |
| **Anatomia da aula §5.3** | Vídeo com marca d'água por aluno, resumo, dispositivos vinculados, material e exercício. A regra "aula sem exercício não publica" é aplicada no seed |
| **Vade-mécum §5.4** | Busca full-text em português com stemming, tolerante a acento, com apelidos indexados e deep link bidirecional aula ↔ artigo |
| **Exercícios §5.5** | Correção imediata com comentário em todas as alternativas; respostas gravadas alimentam estatística e caderno de erros |
| **Área do aluno §5.2** | Continue de onde parou, progresso por matéria, licenças com escopo e origem, caderno de erros |
| **Identidade visual §9** | Design system "Direito Leve" (terracota, teal e mostarda; Montserrat + Quicksand) aplicado a todas as telas, conforme o material entregue. Ver [`docs/identidade-visual.md`](docs/identidade-visual.md) |
| **Preços §7 e §5.9** | Tabela **no banco, com vigência e histórico**: o preço novo vale a partir da data escolhida e não afeta licença vigente. Telas de planos, catálogo e matéria leem a mesma fonte |
| **Autenticação §10** | E-mail e senha com scrypt, sessão revogável (o banco guarda só o hash do token), cookie httpOnly + SameSite. Papéis `aluno`/`admin` |
| **Administração §5.9** | Visão geral, tabela de valores com histórico, concessão e extensão de licenças, busca de alunos — tudo **auditado** (quem, o quê, quando) na mesma transação da alteração |

### O que ainda não está

Checkout e gateway (§8), painel do professor e fechamento de contas (§5.6),
publicidade (§5.7), mural de vagas (§5.7.1), diagnóstico e plano de ensino
(§5.8), hospedagem real de vídeo (§10). O player é um placeholder que já
carrega a marca d'água com os dados do aluno.

Da autenticação faltam **magic link e Google** (§10) e, importante, o
**2FA obrigatório para admin e professor** que o §10 exige — hoje o admin
entra só com senha. O financeiro do admin (recebimentos, inadimplência,
conciliação) depende do gateway e vem junto com ele.

## Estrutura

```
├── discovery.md              # fonte da verdade do produto
├── app/                      # Next.js 16 (App Router)
│   ├── page.tsx              # home
│   ├── catalogo/             # as 7 áreas e 11 matérias
│   ├── materia/[slug]/       # assuntos e aulas, com cadeado por licença
│   ├── aula/[slug]/          # player, abas, vade-mécum lateral e exercício
│   ├── vademecum/            # consulta aberta com busca
│   ├── planos/ · painel/     # licenças e área do aluno
│   └── api/resposta/         # grava resposta de exercício
│   ├── entrar/ · cadastrar/  # autenticação
│   └── admin/                # administração (§5.9)
├── lib/
│   ├── licenca.ts            # motor de licenciamento (§6.3)
│   ├── auth.ts               # senha, sessão e papéis
│   ├── admin.ts              # operações administrativas, todas auditadas
│   ├── precos.ts             # parte pura (vai ao navegador)
│   ├── precos-consultas.ts   # consultas de preço (só servidor)
│   ├── catalogo.ts · vademecum.ts · exercicio.ts · sessao.ts · cache.ts · db.ts
│   └── *.test.ts             # licenças, senha, preços
├── db/                       # migrações e seed, aplicadas em ordem
├── scripts/                  # migrate.mjs · criar-admin.mjs · contraste.mjs
├── testes-e2e/               # verificações no navegador
├── docs/identidade-visual.md
└── prototipo/                # telas estáticas iniciais (histórico)
```

## Decisões que valem registro

- **Sem prerender no build.** As páginas públicas são SSR com consultas em
  cache (`lib/cache.ts`), não SSG. Prerender exigiria banco no `docker build`,
  o que quebra imagem e CI; o Google recebe o mesmo HTML completo.
- **SQL puro, sem ORM.** O vade-mécum depende de `tsvector` em português e de
  índice ponderado; escrever isso direto é mais claro que contornar um ORM.
- **A licença é entidade de primeira classe.** `assinatura` (cobrança) e
  `licenca` (direito de acesso) são separadas — é o que faz Pix avulso,
  cortesia, trial, promocional e cartão recorrente coexistirem sem gambiarra.
- **Comentário de toda alternativa vai junto com a questão.** O aluno já pagou
  pelo conteúdo; esconder o gabarito atrás de outra requisição só somaria
  latência. A resposta é validada no servidor (a alternativa precisa pertencer
  à questão) para que o registro de acerto não seja forjável.
- **A sessão guarda só o hash do token.** Vazar a tabela `sessao` não entrega
  sessão utilizável, e a revogação é imediata — o que um JWT solto no mundo
  não permite.
- **O login não diz se o e-mail existe.** Senha errada e e-mail inexistente
  devolvem a mesma mensagem, e a senha é conferida contra um hash descartável
  mesmo sem usuário, para o tempo de resposta não entregar a diferença.
- **Auditoria na mesma transação da alteração.** O §5.9 exige registro de quem
  mudou preço ou concedeu licença; se o registro fosse depois, uma falha no
  meio deixaria alteração sem rastro.
- **Correção de preço no mesmo dia atualiza a linha.** Trocar o valor no dia em
  que ele passou a valer é erro de digitação, não mudança de tabela: encerrar a
  vigência criaria um registro de duração zero e sujaria o histórico.

## Próximos passos

Do §16 (decisões pendentes) e do §14 (roadmap):

1. **Checkout com Pix e cartão** (§8) — é o que falta para a operação faturar.
   Escolher o gateway pelo critério de split e Pix Automático (§8.2)
2. **2FA para admin e professor** (§10), antes de o admin sair do ambiente local
3. Fechar a **ordem das ondas** — o seed adota a sugestão do §16.1, a confirmar
4. Ingestão do acervo completo do vade-mécum via LexML, com rotina de atualização
5. Definir o timing do fluxo de menores e consentimento parental (§16.8)
6. Job diário da régua de inatividade (§6.5): avisos aos 10 e 11 meses e
   bloqueio aos 12 — o schema e a tela já preveem, o job ainda não existe
