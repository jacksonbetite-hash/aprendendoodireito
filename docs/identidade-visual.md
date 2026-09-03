# Identidade visual — Aprimore o Saber

Claro, branco e roxo. Uma família tipográfica só, cantos generosos, sombra quase
imperceptível e a borda clara fazendo o contorno. O roxo é a única cor de marca:
tudo o que precisa de destaque usa roxo, e nada mais compete com ele.

A referência de padrão é a arquitetura de landing de plataforma SaaS educacional
(hero → prova → grade de áreas → recursos → método → onboarding → CTA → pessoas →
resultados → depoimentos → planos → rodapé), adaptada ao que a plataforma
realmente entrega.

**Tema claro apenas.** O modo escuro foi removido por decisão de projeto.

---

## Paleta

### Superfícies — neutros frios (família slate)

| Token | Hex | Uso |
|---|---|---|
| `--surface` | `#ffffff` | papel da página |
| `--surface-container-low` | `#fafafa` | faixa clara |
| `--surface-container` | `#f6f6f8` | faixa alternada de seção |
| `--surface-container-high` | `#f1f5f9` | chip neutro, degrau acima |
| `--surface-container-highest` | `#e2e8f0` | trilho de progresso |
| `--surface-marca` | `#f7f5ff` | faixa lavanda de marca |
| `--surface-variant` | `#f1f5f9` | borda de cartão |

### Texto

| Token | Hex | Contraste sobre branco |
|---|---|---|
| `--on-surface` | `#0f172a` | 17,85:1 |
| `--on-surface-variant` | `#475569` | 7,58:1 |
| `--outline` | `#64748b` | 4,76:1 |
| `--borda-controle` | `#8493a8` | 3,12:1 (limite de controle) |

### Roxo — e por que são dois

| Token | Hex | Papel |
|---|---|---|
| `--primary` | `#997bf4` | **decorativo**: fundo, borda, ícone. Nunca texto. |
| `--primary-texto` | `#6d28d9` | **texto roxo** sobre claro — 7,10:1 |
| `--primary-container` | `#7c3aed` | fundo sólido com texto branco — 5,70:1 |
| `--primary-fixed` | `#f3f0ff` | fundo de pill lavanda |
| `--on-primary-fixed-variant` | `#5b21b6` | texto sobre a pill lavanda — 8,01:1 |
| `--contorno-pill` | `#c4b5fd` | borda da pill lavanda |
| `--grad-cta` | `#7c3aed → #8a63ff` | gradiente do CTA principal |

**A regra que não se quebra:** `#997bf4` sobre branco dá **3,23:1** e reprova no
WCAG AA. Onde a cor carrega informação lida, é sempre `--primary-texto`. O
`npm run contraste` verifica isso e falha o build de identidade se alguém
esquecer.

### Apoio — semáforo, não marca

Verde `#0f766e` para o que está certo ou concluído, âmbar `#b45309` para o que
está em curso, vermelho `#b91c1c` para erro. Não são cores de marca e não devem
aparecer por decoração.

---

## Tipografia

**Lexend** na interface inteira, do rótulo de 12px ao título de 56px.
**Lora** apenas dentro de `.texto-lei`, onde citação longa de fonte primária pede
serifada e uma voz diferente da do professor.

A hierarquia vem do **contraste de peso** dentro de uma família só: título pesado
(700–900) contra corpo leve (300–400).

| Classe | Tamanho | Peso | Entrelinha |
|---|---|---|---|
| `.display-lg` | 36→56px | 800 | 1.05 |
| `.display-md` | 32→48px | 700 | 1.06 |
| `.headline-lg` | 26→35px | 900 | 1.15 |
| `.headline-md` | 24px | 700 | 1.25 |
| `.titulo-cartao` | 21px | 800 | 1.2 |
| `.rotulo-etapa` | 15px | 700 | uppercase, roxo, `0.06em` |
| `.body-lg` | 18px | 300 | 1.5 |
| `.body-md` | 16px | 400 | 1.5 |
| `.body-sm` | 14px | 400 | 1.57 |
| `.caption` | 12px | 500 | 1.4 |
| `body` | 16px | 400 | 1.5 |

**Título de seção em duas cores** é a assinatura do padrão: metade em preto,
metade em roxo, marcada com `<em>` (que aqui não é itálico, é a tinta da marca).

---

## Forma

| Token | Valor | Onde |
|---|---|---|
| `--r` | 8px | botão |
| `--r-md` | 12px | selo de ícone, campo |
| `--r-lg` | 16px | cartão |
| `--r-xl` | 24px | cartão de plano, faixa de chamada, mídia do hero |
| `--r-full` | 999px | pill, fita, avatar, progresso |

---

## Elevação

Sombra a 5%: o cartão flutua de leve e quem separa mesmo é a borda `#f1f5f9`.
Sombra pesada brigaria com o branco da página.

| Token | Valor |
|---|---|
| `--e1` | `0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.04)` |
| `--e2` | `0 10px 25px rgba(15,23,42,.05)` — padrão do cartão |
| `--e-hover` | `0 10px 30px rgba(15,23,42,.09)` |
| `--e-marca` | `0 10px 40px -10px rgba(153,123,244,.28)` — CTA e plano em destaque |

---

## Componentes que carregam a identidade

- **`.btn-primario`** — o único elemento em gradiente da página. É o que separa a
  ação principal de todo o resto.
- **`.lista-check`** — item com check circular roxo. O elemento mais repetido do
  sistema: hero, cartão de área, cartão de plano, caixa de compra. Uma classe só,
  para que o check seja idêntico nos quatro lugares.
- **`.chip`** — pill de 999px com borda clara. Etiqueta, lista de recursos e fita
  de plano em destaque.
- **`.plano`** — nome em roxo → promessa em preto → posicionamento → "Tudo do X,
  mais:" → lista com check → CTA colado no rodapé do cartão, com altura igualada
  entre os três.
- **`.chamada`** — o único bloco de cor cheia, em degradê `#4c1d95 → #7c3aed`.
  Dentro dele o CTA inverte para branco sólido com texto roxo.
- **`.secao-titulo h2 em`** — o título de seção em duas cores.
- **`.selo-ilustrativo`** — marca conteúdo de avaliação (depoimento escrito para
  o projeto, retrato de banco público, número não medido). Sai junto com o
  conteúdo de exemplo, nunca antes dele.

---

## Ícones

SVG embutido em `app/ui.tsx`, traço de 1.7 com terminais arredondados, sem
dependência de rede. `Icone` devolve `null` para nome desconhecido — nunca
imprime o nome do ícone em texto.

---

## Acessibilidade

- **Contraste**: `npm run contraste` verifica todos os pares realmente usados.
  Texto a 4,5:1, elemento gráfico e borda a 3:1. O script é o portão — nada de
  identidade entra com ele vermelho.
- **Cor nunca sozinha**: o item de navegação ativo tem filete roxo além da cor; a
  alternativa certa tem ícone além da borda verde.
- **Alvo de toque** de 44px em ponteiro grosso.
- **`prefers-reduced-motion`**: a animação de entrada por rolagem some inteira.
- **Foco visível** em `--primary-container` (5,70:1 sobre branco), com offset.
