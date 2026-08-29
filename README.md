# Aprendendo o Direito ⚖️

Protótipo navegável da plataforma de ensino jurídico descrita em
[`discovery.md`](discovery.md) — v1.0, 29/08/2026.

> Entender Direito sem precisar decorar. Aula curta, linguagem de gente, a lei
> ao lado e um exercício no final para provar que você aprendeu.

## O que este protótipo cobre

Recorte do **MVP (Fase 1)** do discovery, na forma de telas navegáveis:

| Tela | Arquivo | O que demonstra |
|---|---|---|
| Home | `site/index.html` | Proposta de valor, anatomia da aula (§5.3), vade-mécum como diferencial (§5.4), catálogo em ondas |
| Catálogo | `site/catalogo.html` | As 7 áreas e as 11 matérias de partida (§4), com ondas de lançamento e "em breve" com lista de espera |
| Matéria | `site/materia.html` | Assunto → aula com cadeado, 1ª aula grátis, box de licença por matéria (§6.1) |
| Aula | `site/aula.html` | Player com marca d'água (§10), abas resumo/lei/material/anotações, **painel lateral do vade-mécum** e exercício de 5 questões com comentário em todas as alternativas (§5.3) |
| Vade-mécum | `site/vademecum.html` | Consulta aberta, busca com atalho `/`, favoritos, deep link artigo ↔ aula, carimbo "texto conferido em" (§5.4) |
| Planos | `site/planos.html` | Camadas de acesso (§6.1), tabela de preços por período (§7), 7 dias do CDC e cancelamento em 2 cliques (§6.6) |
| Área do aluno | `site/app.html` | Continue de onde parou, progresso por matéria, **licenças ativas com escopo e origem** (§11), caderno de erros, conta e LGPD |

Todas as telas são responsivas — o aluno é mobile-first, conforme §9.

### O que ainda NÃO está no protótipo

Fora do recorte, por serem Fase 2/3 no discovery ou por dependerem de backend:
admin, painel do professor e fechamento de contas (§5.6), checkout real e
gateway (§8), frente publicitária (§5.7), mural de vagas (§5.7.1), diagnóstico
e plano de ensino sugerido (§5.8), autenticação, e persistência de dados.
As interações da tela são simuladas em JavaScript, sem servidor de aplicação.

## Estrutura

```
├── discovery.md                # documento de discovery (fonte da verdade)
├── site/                       # o protótipo (HTML/CSS/JS estáticos)
│   ├── index.html · catalogo.html · materia.html · aula.html
│   ├── vademecum.html · planos.html · app.html
│   ├── css/styles.css          # design system (§9: descontraído, acolhedor)
│   └── js/app.js               # exercício, abas, busca do vade-mécum, planos
├── tools/build-page.sh         # monta as páginas a partir dos fragmentos
├── tools/partials/             # header e footer compartilhados
├── Dockerfile · nginx.conf · docker-compose.yml
```

O protótipo é estático de propósito: o alvo de produção é Next.js 15 +
PostgreSQL + Redis (§10), e estas telas servem para validar fluxo e visual
antes de escrever o código de produto.

## Rodar com Docker

```bash
docker compose up -d --build
```

Abre em **http://localhost:8080**. Para parar: `docker compose down`.

## Rodar sem Docker

```bash
cd site && python -m http.server 8080
```

## Regenerar uma página

Header e footer são compartilhados via fragmentos (não há build step no
navegador):

```bash
tools/build-page.sh site/planos.html "Título" "Descrição" corpo.html
```

## Próximos passos sugeridos

Seguindo o roadmap do discovery (§14) e as decisões pendentes (§16):

1. Fechar a **ordem das ondas** — quais 3 a 5 matérias abrem (decisão §16.1)
2. Validar preço e disposição a pagar na Fase 0 antes de fixar a tabela (§7)
3. Modelar o banco a partir de §11, com `licenca` como entidade de primeira
   classe e testes cobrindo a matriz escopo × status × vigência (risco §15.8)
4. Escolher o gateway pelo critério de split e Pix Automático (§8.2)
5. Decidir o timing do fluxo de menores / consentimento parental (§16.8)
