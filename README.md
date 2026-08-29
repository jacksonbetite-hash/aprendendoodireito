# Aprendendo o Direito ⚖️

Plataforma de ensino jurídico descrita em [`discovery.md`](discovery.md) (v1.0,
29/08/2026). Este repositório é a implantação da **Fase 1 (MVP)** do roadmap §14.

> Entender Direito sem precisar decorar. Aula curta, linguagem de gente, a lei
> ao lado e um exercício no final para provar que você aprendeu.

## Subir tudo

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

### Desenvolvimento

```bash
docker compose up -d db                 # só o Postgres
export DATABASE_URL=postgres://aprendendo:aprendendo@localhost:5432/aprendendoodireito
npm install && npm run migrate && npm run dev
npm test                                # motor de licenças
```

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
| **Preços §7** | Tabela por período em `lib/precos.ts`, um único lugar (vira tabela versionada quando o admin do §5.9 existir) |

### O que ainda não está

Autenticação (a sessão resolve um aluno fixo por `ALUNO_DEMO`), checkout e
gateway (§8), admin (§5.9), painel do professor e fechamento de contas (§5.6),
publicidade (§5.7), mural de vagas (§5.7.1), diagnóstico e plano de ensino
(§5.8), hospedagem real de vídeo (§10). O player é um placeholder que já
carrega a marca d'água com os dados do aluno.

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
├── lib/
│   ├── licenca.ts            # motor de licenciamento (§6.3)
│   ├── licenca.test.ts       # matriz escopo × status × vigência
│   ├── catalogo.ts · vademecum.ts · exercicio.ts · sessao.ts
│   ├── precos.ts · cache.ts · db.ts
├── db/                       # migrações e seed, aplicadas em ordem
├── scripts/migrate.mjs       # runner idempotente
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

## Próximos passos

Do §16 (decisões pendentes) e do §14 (roadmap):

1. Fechar a **ordem das ondas** — o seed adota a sugestão do §16.1, a confirmar
2. Autenticação e, na sequência, checkout com Pix e cartão (§8)
3. Admin de valores, licenças e cadastros (§5.9) — o §5.9 chama de coração da operação
4. Ingestão do acervo completo do vade-mécum via LexML, com rotina de atualização
5. Definir o timing do fluxo de menores e consentimento parental (§16.8)
