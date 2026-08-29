# Identidade visual — "Direito Leve"

Sistema de design **Modern Humanist**: caloroso, otimista e educacional.
Afasta-se da estética intimidadora do Direito tradicional para que conceitos
complexos pareçam acessíveis, não excludentes.

Tokens e telas vêm do design system entregue pelo responsável
(`stitch_direito_leve`). A fonte da verdade em código é `app/globals.css`.

## Paleta

Palete "warm-professional": evita o azul corporativo frio por um espectro
terroso e vibrante.

| Papel | Token | Cor | Uso |
|---|---|---|---|
| **Primária** — terracota | `--primary` | `#9f402d` | ações principais, marca, conceito em destaque |
| Terracota clara | `--primary-container` | `#e2725b` | faixas de chamada, player |
| Terracota tinta | `--primary-fixed` | `#ffdad3` | etiquetas, selos |
| **Secundária** — teal | `--secondary` | `#01696c` | navegação, ações de apoio, "Você sabia?" |
| Teal tinta | `--secondary-fixed` | `#a1f0f3` | avisos, item ativo da lateral |
| **Terciária** — mostarda | `--tertiary` | `#7c5800` | conquistas, dicas, momentos de "acendeu a lâmpada" |
| Mostarda tinta | `--tertiary-fixed` | `#ffdea7` | avisos de atenção |
| **Texto** — navy profundo | `--on-surface` | `#101b30` | autoridade sem a dureza do preto |
| Texto secundário | `--on-surface-variant` | `#56423e` | apoio, metadados |
| Fundo | `--surface` | `#f9f9ff` | off-white que reduz cansaço na leitura longa |
| Camadas | `--surface-container-*` | `#ffffff` → `#d7e2ff` | hierarquia por tonalidade |
| Borda de controle | `--borda-controle` | `#7a87ae` | limite de componente interativo |

## Tipografia

- **Montserrat** — títulos e rótulos. Geometria confiante, arquitetural e acessível.
- **Quicksand** — texto corrido. Terminais arredondados fazem explicação jurídica
  densa parecer gentil. Entrelinha de 1.6 para o termo jurídico respirar.
- **Lora** — **exclusiva para texto de lei**. Separa a voz da lei da voz do
  professor e sustenta leitura longa. Não use em nenhum outro lugar.

## Forma

Arredondamento pronunciado, canto vivo é evitado de propósito — é o que
distancia a marca das "arestas duras" do Direito tradicional.

- Botões, campos e etiquetas: `--r` (8px)
- Cartões de conteúdo: `--r-xl` (24px)
- Progresso e chips: `--r-full` (cápsula)

## Elevação

Camadas tonais + sombra ambiente. As sombras levam uma tinta da terracota para
não parecerem cinza sujo — devem soar como brilho suave, não sombra dura. No
hover, o cartão sobe e cresce 1%, dando resposta tátil.

## Componentes que carregam a identidade

- **Cartão de aula** — título em Montserrat, resumo em Quicksand, progresso em mostarda.
- **"Você sabia?"** (`.sabia`) — fundo em tinta de teal com filete grosso à esquerda.
- **Comentário da Professora** (`.comentario`) — usado no exercício, com XP em mostarda.
- **Chip de glossário** (`.chip-glossario`) — define termo jurídico em português claro.
- **Anel de progresso** — desempenho por matéria no painel do aluno.

## Ícones

SVG embutido em `app/ui.tsx`, traço de 1.7 com pontas arredondadas.

Fonte de ícones foi **descartada de propósito**: quando ela falha em carregar,
a tela mostra o nome do ícone em texto cru ("play_circle") — pior que não
mostrar nada. SVG embutido não depende de rede e some silenciosamente se o
nome não existir.

## Acessibilidade

O §9 do discovery exige **WCAG 2.1 AA**. `scripts/contraste.mjs` verifica os
22 pares usados na interface:

```bash
npm run contraste
```

Dois ajustes foram necessários em relação ao design entregue:

1. **Faixa de chamada.** Texto branco sobre a terracota clara (`#e2725b`) dá
   3.09:1, abaixo do mínimo de 4.5. A faixa usa um tom mais fechado
   (`#b84e3a`, 5.01:1) com gradiente para o container, preservando o calor.
2. **Borda de controle.** `--surface-variant` sobre branco dá 1.30:1; o WCAG
   1.4.11 exige 3:1 para limites de componente interativo. Alternativas,
   campos e busca usam `--borda-controle` (3.56:1).

Ao mexer em qualquer cor, rode a verificação antes de commitar.
