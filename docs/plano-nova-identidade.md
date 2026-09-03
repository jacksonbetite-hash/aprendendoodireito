# Plano — trocar o padrão "Direito Leve" pelo padrão ChatSkills

Referência: <https://chatskills.com.br/ia/#planos>
Levantamento feito em 31/08/2026 com Chrome headless (`playwright-core`), lendo os
**estilos computados** do DOM real. O site responde 403 a `curl`, e o conversor de
markdown do WebFetch descarta CSS — por isso a extração via navegador.

---

> **Estado em 31/08/2026:** Fases 1 a 6 executadas. `npm run contraste`, `npm test`,
> `npm run build` e os roteiros e2e de autenticação e comercial passam. O roteiro
> `administracao.mjs` não rodou por falta da variável `SENHA_ADMIN`. Pendências
> conhecidas no §8.

---

## 1. O que a referência é, de fato

### 1.1 Tipografia — uma família só

| Papel | Valor real medido |
|---|---|
| Família única | **Lexend**, sans-serif (Google Fonts) |
| H1/H2 de seção | 48px / **700** / line-height 51px (≈1.06) |
| H2 de destaque | 35–48px / **900** em blocos de maior peso |
| H3 de card | 21px / **800** |
| H3 rótulo ("ETAPA 1") | 15px / 700 / **uppercase** / roxo |
| Subtítulo de seção | 18–19px / **300–400** / slate-600 |
| Corpo | 14–16px / 400 / line-height 22–24px |
| Botão | 16px / **700** |
| Nome em card de pessoa | 20px / 700 · função 12px / 500 roxo |

Não há serifada em lugar nenhum. Letter-spacing normal em tudo.

### 1.2 Paleta — claro, branco, roxo

| Papel | Valor medido |
|---|---|
| Fundo da página | `#FFFFFF` / `#FFFFFC` |
| Fundo alternado de seção | `#F6F6F8`, `#FAFAFA`, `#F7F5FF` (lavanda) |
| Roxo de marca | `#997BF4` |
| Gradiente de CTA | `linear-gradient(90deg, #8A63FF 0%, #A974FF 100%)` |
| Roxo em texto/ícone | `#997BF4`, `#9C7CF4`, `#8D65FF` |
| Lavanda de fundo de pill | `#F3F0FF`, borda `#C4B5FD` |
| Texto principal | `#333333` (corpo) e `#0F172A` (títulos de card) |
| Texto secundário | `#475569` (slate-600), `#64748B` (slate-500) |
| Borda de card | `#F1F5F9` (slate-100) |
| Borda de pill neutra | `#E2E8F0` (slate-200) |

É a paleta **Tailwind slate + violet**, não uma paleta autoral. Isso facilita — os
valores são reproduzíveis exatamente.

### 1.3 Forma e elevação

| Token | Valor medido |
|---|---|
| Raio de card de plano | **24px** |
| Raio de card de conteúdo | **16px** |
| Raio de botão | **8px** |
| Raio de pill/badge | **999px** |
| Sombra de card | `0 10px 25px rgba(0,0,0,0.05)` |
| Sombra alternativa | `0 10px 30px rgba(15,23,42,0.06)` |
| Sombra roxa (destaque) | `0 10px 40px -10px rgba(153,123,244,0.15)` |
| Borda de card | `1px solid #F1F5F9` |
| Padding de card de plano | `30px 35px` |
| Padding de botão | `16px 80px` (CTA largo) |
| Padding de pill | `10px 18px` |

Cantos generosos, sombra quase imperceptível, borda clara fazendo o contorno. O
contrário do nosso `--e2` atual, que é mais pesado.

### 1.4 Arquitetura da landing (ordem real, de cima para baixo)

1. **Header fixo** (`position: fixed`, fundo branco, 123px, sem sombra) — logo à
   esquerda, 3 links à direita (Soluções · Cursos · Planos), link ativo sublinhado.
2. **Hero** — grade 2 colunas: à esquerda H1 com **primeira linha em roxo e o resto
   em preto**, subtítulo, **grade 2×2 de bullets com ícone de check circular roxo**,
   e um CTA em gradiente. À direita, mídia em card de canto 24px com "chips
   flutuantes" sobre a imagem.
3. **Faixa de prova social** — logos de clientes em cinza, fundo `#F6F6F8`.
4. **Título de seção** ("Resultados em **todos os setores**" — segunda metade em roxo).
5. **Grade 4 de cards por segmento** (`#solucoes`) — cada card: título 21px/800 +
   lista com check roxo.
6. **Seção de personalização** com **pills** (white label, onboarding, gamificação…).
7. **Seção "gerencie por WhatsApp"** — 2+2 icon-boxes.
8. **CTA intermediário** ("Quero começar agora!").
9. **Onboarding em 3 etapas** — cards brancos com rótulo "ETAPA N" em roxo uppercase.
10. **Faixa escura/gradiente** com CTA de consultoria.
11. **Carrossel de especialistas** (`#especialistas`, fundo `#FAFAFA`) — cards com
    foto, nome 20px/700 e especialidade 12px/500 roxo.
12. **Estatísticas** (77,7% · 88,9% · 94,4%).
13. **Depoimentos** — 3 cards com citação, nome e cargo.
14. **Planos** (`#planos`) — ver abaixo.
15. **Formulário "Converse com um especialista"**.
16. **Rodapé** — descrição + redes + 2 colunas de links + contato + legal.

### 1.5 A seção de planos, medida

- Título "Planos sob medida" 48px/700 + subtítulo cinza.
- **3 cards de 369px × 646px**, altura igualada, gap ~35px.
- Card padrão: `background #FFF`, `border 1px solid #F1F5F9`, `radius 24px`,
  `box-shadow 0 10px 25px rgba(0,0,0,.05)`, `padding 30px 35px`.
- Card destacado: **`border 2px solid #997BF4`** + fita **"MAIS ESCOLHIDO"** em
  pill roxa (`radius 500px`) encavalada na borda superior.
- Conteúdo do card, nesta ordem: **nome do plano em roxo** (24px/700) → **promessa
  em preto** (24px/700) → **frase de posicionamento em roxo claro/slate** → linha
  "Tudo do X, mais:" em roxo → **lista com check circular roxo** → CTA em gradiente
  colado no rodapé do card.
- **Não exibe preço.** O nosso exibe, e vai continuar exibindo (somos self-service);
  a estrutura visual do card é o que se copia.

Capturas de apoio (temporárias, na scratchpad da sessão): `ref-hero.png`,
`ref-planos.png`, `ref-full.png`.

---

## 2. De onde partimos

O ponto favorável: **o sistema atual já é dirigido por tokens**. `app/globals.css`
(1.097 linhas) concentra a identidade inteira em um bloco `:root`, e nenhuma regra
abaixo dele sabe qual tema está ativo. Todas as 19 telas usam classes semânticas
(`.cartao`, `.btn-primario`, `.chip`, `.plano`, `.secao`) — não há cor solta no TSX,
salvo dois `style={{}}` na home.

Consequência prática: **a maior parte da troca de identidade é substituir ~60 linhas
de token.** O trabalho real está em (a) forma e tipografia, que mudam de caráter, e
(b) a arquitetura da home, que hoje tem 4 seções contra 16 da referência.

O que hoje conflita com o padrão ChatSkills:

| Hoje ("Direito Leve") | ChatSkills |
|---|---|
| Terracota `#9F402D` + teal + mostarda | Roxo `#997BF4` único |
| 3 famílias (Montserrat, Quicksand, Lora) | 1 família (Lexend) |
| Neutros **quentes** (creme `#FDFAF8`) | Neutros **frios** (branco + slate) |
| Corpo em weight 500 | Corpo em weight 400, títulos 700–900 |
| Raios 8/12/16/24px, sombra média | Raios 8/16/24/999px, sombra 5% |
| Modo escuro completo | Só claro |
| Botão sólido chapado | Botão em gradiente |

---

## 3. Decisões — TOMADAS em 31/08/2026

| # | Decisão | Consequência |
|---|---|---|
| **D1** | **Remover o modo escuro.** | Sai o bloco `@media (prefers-color-scheme: dark)` (60 tokens) e a tabela `ESCURO` do `contraste.mjs`. `color-scheme: light` fixo. |
| **D2** | **Lexend na interface inteira + Lora só em `.texto-lei`.** | Duas famílias, não três. |
| **D3** | **Dois roxos.** `#997BF4` decorativo, `#6D28D9` para texto (7,10:1), CTA `#7C3AED → #8A63FF`. | O portão `npm run contraste` continua valendo. |
| **D4** | **Fotos públicas + depoimentos criados.** | Fase de avaliação de conteúdo. Ver §3.1. |
| **D5** | **O sistema deixa de ser específico de Direito e passa a se chamar "Aprimore o Saber".** | Ver §3.2 — é a decisão de maior alcance. |

### 3.1 Sobre os depoimentos e as fotos (D4)

Os depoimentos são **escritos por mim, não são de clientes reais**. Ficam marcados
como conteúdo ilustrativo na interface e comentados como tal no código. Isso não é
zelo excessivo: depoimento inventado exibido como genuíno em site no ar é
publicidade enganosa (CDC, art. 37). Enquanto for avaliação de conteúdo, o rótulo
resolve; antes de publicar, ou vira depoimento real ou a seção sai.

As fotos vêm de banco de imagens público com licença livre de uso comercial,
referenciadas por URL. Nenhuma pessoa retratada endossa o produto — mais um motivo
para o rótulo de ilustrativo.

### 3.2 A virada de escopo (D5) — o que entra nesta fase e o que não entra

"Genérico" atinge três camadas de profundidade muito diferentes:

| Camada | Nesta fase |
|---|---|
| **Marca e metadados** — nome, título, rodapé, `Marca`, aviso legal | **Sim.** "Aprendendo o Direito" → **"Aprimore o Saber"** em toda a interface. |
| **Copy de superfície** — home, planos, cadastro, painel, e-mails visíveis | **Sim.** Sai "Direito", "juridiquês", "decoreba de lei"; entra a linguagem de plataforma de cursos em geral. |
| **Navegação** — o rótulo "Vade-mécum" | **Sim.** Vira **"Biblioteca"**. A rota `/vademecum` e o código continuam; muda o rótulo e o texto de apoio. |
| **Dados** — seeds de matérias, aulas, questões e normas jurídicas em `db/002…007` | **Não.** Continuam sendo o acervo de exemplo. São ~6 arquivos de seed e um schema com tabela de norma/dispositivo; trocar isso é migração de dados, não re-skin, e merece fase própria. |
| **Infraestrutura** — nome do banco, da imagem Docker, da pasta do repositório | **Não.** Renomear quebra instalação existente sem ganho visível. |

Ou seja: **quem abre o site vê "Aprimore o Saber", uma plataforma de cursos
genérica; quem abre o banco ainda encontra o acervo de Direito como conteúdo de
demonstração.** É a divisão honesta para uma fase de avaliação de conteúdo. Se você
quiser o acervo trocado também, isso é a fase seguinte e eu monto o plano dela.

---

## 3.9 (histórico) Decisões propostas, antes da confirmação

**D1 — Modo escuro.** A referência não tem. Nós temos um tema escuro inteiro
(60 tokens + `scripts/contraste.mjs` valida os dois). Recomendo **manter** e
reescrever em roxo/slate: é acessibilidade real para quem estuda à noite, e
descartá-lo é jogar fora trabalho já pago. Se você quiser paridade literal com a
referência, removo o bloco `@media (prefers-color-scheme: dark)`.

**D2 — A serifada do texto de lei.** Hoje `Lora` separa "a voz da lei" da "voz do
professor" no vade-mécum. Adotar Lexend em tudo (padrão ChatSkills) apaga essa
distinção. Recomendo **Lexend na interface inteira + manter Lora exclusivamente
dentro de `.texto-lei`** — é a única exceção, e resolve legibilidade de texto legal
longo. Se quiser fidelidade total, tiro a Lora.

**D3 — Roxo em texto falha AA.** Medi: `#997BF4` sobre branco dá **3,23:1** — abaixo
do mínimo 4,5:1 do WCAG AA, que o §9 do discovery exige e o `npm run contraste`
bloqueia. A referência tem esse problema; nós não podemos herdá-lo. Solução:
**dois roxos** — `#997BF4` para preenchimentos, bordas, ícones e fundos (decorativo,
onde 3:1 basta), e `#6D28D9` (**7,10:1**) para texto roxo sobre claro. Visualmente é
o mesmo roxo, uma nota mais fundo. Idem no botão: branco sobre `#997BF4` dá 3,23:1,
então o gradiente do CTA fica `#7C3AED → #8A63FF` (branco a 5,70:1).

**D4 — Nome e assets.** Continuamos "Aprendendo o Direito" com a marca atual, só
retematizada em roxo? Assumo que sim. A referência usa fotos de pessoas e logos de
clientes que não temos — as seções equivalentes (prova social, especialistas,
depoimentos) entram como **estrutura pronta com conteúdo nosso ou placeholder
declarado**, nunca com depoimento inventado.

---

## 4. Novo token set (proposta fechada)

Substitui o bloco `:root` de `app/globals.css` linhas 24–108.

### Claro

```
--surface: #ffffff            --on-surface: #0f172a
--surface-dim: #f1f5f9        --on-surface-variant: #475569
--surface-container-lowest: #ffffff
--surface-container-low: #fafafa
--surface-container: #f6f6f8
--surface-container-high: #f1f5f9
--surface-container-highest: #e2e8f0
--surface-variant: #f1f5f9    --outline: #64748b
--surface-marca: #f7f5ff      --outline-variant: #e2e8f0
                              --borda-controle: #94a3b8

--primary: #997bf4            /* decorativo: fundo, borda, ícone */
--primary-texto: #6d28d9      /* texto roxo sobre claro — 7,10:1 */
--on-primary: #ffffff
--primary-container: #7c3aed  /* fundo sólido com texto branco — 5,70:1 */
--primary-fixed: #f3f0ff      /* pill lavanda */
--on-primary-container: #4c1d95
--contorno-pill: #c4b5fd
--grad-cta: linear-gradient(90deg, #7c3aed 0%, #8a63ff 100%)

--secondary: #0f766e          /* sucesso/confirmação (check, "concluído") */
--tertiary: #b45309           /* atenção/destaque de progresso */
--error: #b91c1c

--r-sm: 4px   --r: 8px   --r-md: 12px   --r-lg: 16px   --r-xl: 24px   --r-full: 999px

--e1: 0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.04);
--e2: 0 10px 25px rgba(15,23,42,.05);
--e-hover: 0 10px 30px rgba(15,23,42,.09);
--e-marca: 0 10px 40px -10px rgba(153,123,244,.28);

--font-display: "Lexend", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-body:    "Lexend", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-lei:     "Lora", Georgia, serif;   /* só se D2 = manter */
```

### Escuro (se D1 = manter)

Superfícies slate-900 → slate-700 (`#0b1120 · #131b2e · #1c2740 · #24324f`), texto
`#e2e8f0` / `#94a3b8`, roxo clareia para `#c4b5fd` (texto) e `#a78bfa` (fill), CTA
vira `#8b5cf6 → #a974ff`, sombra some e a separação passa a ser o degrau de camada
— exatamente a lógica que o arquivo já usa hoje.

### Escala tipográfica

```
.display-lg   56px / 800 / 1.05 / -0.02em
.display-md   48px / 700 / 1.06
.headline-lg  35px / 900 / 1.15
.headline-md  24px / 700 / 1.25
.titulo-card  21px / 800 / 1.2
.rotulo-etapa 15px / 700 / uppercase / --primary-texto / 0.06em
.body-lg      18px / 300 / 1.5   (subtítulo de seção)
.body-md      16px / 400 / 1.5
.body-sm      14px / 400 / 1.57
.caption      12px / 500
body          16px / 400 / 1.5   (hoje é 500 — cai para 400)
```

---

## 5. Execução, fase a fase

### Fase 1 — Fundação (bloqueia todo o resto)
| # | Arquivo | O que muda |
|---|---|---|
| 1.1 | `app/layout.tsx` | Trocar o `<link>` do Google Fonts: `Lexend:wght@300;400;500;600;700;800;900` (+ `Lora` só se D2 = manter). Remover Montserrat e Quicksand. |
| 1.2 | `app/globals.css` §tokens | Substituir os blocos claro e escuro pelo item 4. |
| 1.3 | `app/globals.css` §tipografia | Reescrever a escala; `body` weight 500 → 400; `h1..h5` para 700–900. |
| 1.4 | `scripts/contraste.mjs` | Reescrever as tabelas `CLARO`/`ESCURO` com os novos hex e **acrescentar os pares novos** (`primaryTexto/surface`, `onPrimary/primaryContainer`, `primaryTexto/primaryFixed`). É o portão de qualidade: nada avança com ele vermelho. |
| 1.5 | `docs/identidade-visual.md` | Reescrever o documento inteiro — hoje descreve "Direito Leve" e passaria a mentir. |

**Verificação da fase:** `npm run contraste` verde + `npm run build`.

### Fase 2 — Componentes base (`app/globals.css`)
| # | Bloco | O que muda |
|---|---|---|
| 2.1 | `.btn*` | Raio 8px, weight 700, padding `16px 32px` (`.btn-lg` `16px 56px`). `.btn-primario` passa a usar `--grad-cta`; hover escurece o gradiente + `translateY(-1px)`. `.btn-contorno` com borda `--primary`. |
| 2.2 | `.chip` | Virar pill 999px, `padding 10px 18px`, fundo `--primary-fixed`, borda `--contorno-pill`. Nova variante `.chip-fita` para o "MAIS ESCOLHIDO". |
| 2.3 | `.cartao` | Raio 16px (`.cartao-plano` 24px), `border 1px solid var(--surface-variant)`, sombra `--e2`, padding 24px (plano: `30px 35px`). |
| 2.4 | Novos | `.lista-check` (item com ícone check circular roxo — usado em hero, cards de setor e planos, é o elemento mais repetido da referência), `.rotulo-etapa`, `.pills` (linha de pills que quebra), `.estatistica`, `.depoimento`, `.faixa-logos`. |
| 2.5 | `.topo` | `position: fixed`, fundo sólido, `backdrop-filter`, link ativo com **sublinhado roxo** (hoje é só cor). Compensar com `padding-top` no `main`. |
| 2.6 | `.secao` / `.secao-titulo` | `.secao.tinta` passa a `#f6f6f8`; nova `.secao.marca` (`#f7f5ff`). Título de seção 48px/700 com `<em>` em roxo (o "duas cores no mesmo título" é a assinatura da referência). |
| 2.7 | `.hero` | H1 56px/800 com primeira linha em roxo; substituir a `.busca-hero` por **grade 2×2 de `.lista-check`** + CTA em gradiente, seguindo a referência. |

### Fase 3 — Home (`app/page.tsx`)
Reescrever para a arquitetura da referência, com o nosso conteúdo real:

| Seção da referência | O que vira aqui | Fonte do dado |
|---|---|---|
| Hero + bullets 2×2 | "Entenda Direito sem decorar" + 4 provas (aulas curtas, lei comentada, questões, vade-mécum) | fixo |
| Prova social | Faixa de números (matérias · aulas · questões) — não temos logos de clientes | já calculado em `page.tsx` |
| Grade 4 de setores | **Áreas do Direito** (já existe) — recartonar no formato "título + lista com check" | `listarAreasEmCache` |
| Pills de personalização | Pills de recursos (vade-mécum, questões comentadas, progresso, offline…) | fixo |
| Icon-boxes | "Como funciona" (já existe, 3 passos) migrado para 2×2 ou 3 icon-boxes | fixo |
| Onboarding 3 etapas | "ETAPA 1/2/3" — assista, consulte a lei, resolva | reaproveita os 3 passos atuais |
| Faixa escura de CTA | `.chamada` atual, retematizada em gradiente roxo | fixo |
| Especialistas | **Professores/áreas** — placeholder declarado até termos as fotos (D4) | pendente |
| Estatísticas | 3 números da plataforma | derivado do catálogo |
| Depoimentos | **Só entra com depoimento real.** Sem isso, corto a seção. | pendente |
| Planos | Recorte dos 3 planos com link para `/planos` | `lib` de preços |
| Rodapé | O atual, reestilizado (mantém o bloco legal do CDC) | `componentes.tsx` |

### Fase 4 — `/planos` (`app/planos/page.tsx` + `SeletorPeriodo.tsx`)
Card de plano no formato medido no item 1.5: nome em roxo → promessa em preto →
posicionamento → "Tudo do X, mais:" → `.lista-check` → CTA em gradiente no rodapé
do card, alturas igualadas. Destaque com borda 2px roxa + fita "MAIS ESCOLHIDO"
encavalada. **Mantemos o preço** (o card ganha o bloco valor/período entre a
promessa e a lista). `.alternador` de período vira pill segmentada 999px.

### Fase 5 — Telas internas (a parte que costuma ficar para trás)
| Tela | Ajuste |
|---|---|
| `app/painel/page.tsx` | `.lateral` (fundo branco, item ativo em lavanda `--primary-fixed` com texto `--primary-texto`), `.anel` de progresso em roxo, `.retomar`, `.atalho`, `.indicador` |
| `app/materia/[slug]` | `.cabeca-materia`, `.linha-aula`, `.caixa-compra` (vira card 24px), `.lista-inclui` → `.lista-check` |
| `app/aula/[slug]` + `AbasAula` | `.player` (gradiente roxo no lugar do marrom), `.abas` com indicador roxo, `.item-modulo` |
| `app/Exercicio.tsx` | `.alternativa` (raio 16px, borda slate, hover roxo), estados certa/errada nas cores novas, `.comentario`, `.resultado-exercicio` |
| `app/vademecum/*` | `.vade-menu`, `.norma`, `.dispositivo`, `.texto-lei` (decisão D2), `.painel-lei`, `.busca-vade` |
| `app/catalogo/page.tsx` | Cards no novo padrão |
| `app/entrar`, `/cadastrar`, `FormAuth` | `.cartao-auth` raio 24px, campos com borda slate e foco roxo |
| `app/conta`, `app/checkout/[referencia]` | Cartões, alertas, `.tabela` |
| `app/admin/*` | `.tabela`, `.form-linha`, `.item-lateral.ativo-admin` — a área admin herda quase tudo, ajuste pequeno |
| `prototipo/css` | Os HTML estáticos do protótipo ficam **desatualizados**. Decidir: atualizar junto ou marcar como histórico no `prototipo/LEIA-ME.md`. Recomendo marcar como histórico. |

### Fase 6 — Verificação
1. `npm run contraste` — tem de passar nos dois temas (ou só no claro, se D1 = remover).
2. `npm run build` — sem erro de tipo.
3. `npm run e2e` — os 3 roteiros (autenticação, comercial, administração) usam
   seletores; se algum depender de classe que eu renomear, corrijo no mesmo passo.
4. Captura antes/depois de cada uma das 19 telas em 1440px e 390px, com o mesmo
   script de Playwright que usei para levantar a referência.
5. Checagem manual: `prefers-reduced-motion`, impressão do vade-mécum, foco visível
   por teclado (o `outline` de foco muda de teal para roxo).

---

## 6. Ordem, esforço e risco

| Fase | Esforço | Risco |
|---|---|---|
| 1 — Fundação | baixo (~60 linhas de token + fontes) | **baixo** — reversível em um commit |
| 2 — Componentes base | médio | médio — mexe em regra usada por todas as telas |
| 3 — Home | **alto** — é reescrita, não retoque | médio — depende de D4 (conteúdo que não temos) |
| 4 — Planos | médio | baixo |
| 5 — Telas internas | médio-alto (12 telas) | **é onde o trabalho vaza**: cada tela tem detalhe próprio |
| 6 — Verificação | baixo | baixo |

**Riscos concretos:**

1. **Contraste** (D3). O roxo da referência não passa em AA como texto. Já está
   resolvido no plano com os dois roxos, mas é o ponto que exige disciplina: a
   tentação de usar `#997BF4` em texto vai aparecer em toda tela.
2. **Conteúdo inexistente.** Prova social, especialistas e depoimentos são 3 das 16
   seções da referência e dependem de material que não está no repositório. Sem eles
   a home fica visivelmente mais curta que a referência — o que é honesto, mas
   precisa ser uma decisão sua, não uma omissão minha.
3. **Perda de diferenciação.** O "Direito Leve" foi desenhado no §9 do discovery
   justamente para fugir do azul/roxo corporativo de SaaS. Adotar o padrão ChatSkills
   é reverter essa decisão. Registro o ponto e sigo — a escolha é sua.
4. **Protótipo estático divergente.** `prototipo/` passa a mostrar a identidade antiga.
5. **Fonte externa.** Lexend vem do Google Fonts, igual às atuais — sem mudança de
   risco de rede, mas trocamos 3 famílias por 1 (ou 2), o que **reduz** o peso.

---

## 7. Entrega sugerida

Um commit por fase, nesta ordem, cada um com a verificação da fase passando:

```
1. Adota os tokens e a tipografia do padrão ChatSkills
2. Reescreve botao, chip, cartao, topo e secao no novo padrao
3. Reconstroi a home na arquitetura de 16 secoes
4. Refaz os cards de plano no formato de tres colunas
5. Propaga o padrao para painel, aula, exercicio, vade-mecum e admin
6. Atualiza contraste, e2e e capturas
```

Confirme D1–D4 e eu começo pela Fase 1.

---

## 8. O que ficou pendente

1. **Acervo de conteúdo ainda é de Direito.** Por decisão §3.2, os seeds
   `db/002…007` não foram tocados: o catálogo mostra "Direito Público",
   "Penal", "Processo", e a Biblioteca serve CF/88, CDC, CC e CP. A moldura é
   genérica; o recheio é o acervo de demonstração. Trocar isso é a fase seguinte.
2. **Conteúdo ilustrativo em três seções da home** — especialistas, resultados e
   depoimentos. Cada uma carrega o selo `.selo-ilustrativo` na própria página, e
   `app/page.tsx` abre com o bloco de comentário explicando por quê. Antes de
   publicar: vira conteúdo real com autorização de uso de imagem, ou a seção sai
   junto com o selo.
3. **Retratos vêm de `i.pravatar.cc`** por URL externa. É serviço de retratos de
   exemplo, adequado para avaliação e inadequado para produção — em produção as
   fotos entram em `public/`.
4. **`testes-e2e/administracao.mjs` não foi executado**: exige `SENHA_ADMIN`, a
   senha que `scripts/criar-admin.mjs` imprime. As telas de admin foram
   verificadas por build e por leitura, não por navegador.
5. **`prototipo/`** teve só o nome da marca atualizado no rename posterior; a
   identidade visual continua a antiga. Marcado como histórico.
6. **Infraestrutura mantinha o nome antigo** nesta fase: banco, imagem Docker,
   pasta do repositório e `lib/db.ts`. ~~Renomear quebraria instalação existente
   sem ganho visível.~~ **Resolvido em 01/09/2026**: tudo passou a
   `aprimoreosaber`, com dump e restore dos dados. Ver o README.
7. **`AGENTS.md` e `CLAUDE.md` na raiz** foram gerados pelo `next dev` do Next 16,
   não por esta mudança. Decidir se entram no versionamento ou no `.gitignore`.
