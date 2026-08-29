# Identidade visual — "Sala de Aula"

Verde-petróleo com âmbar sobre um quase-branco frio. Fresco e confiante, com
cara de plataforma de estudo contemporânea — sem a solenidade de azul-marinho
institucional que o §9 do discovery pede para evitar.

A fonte da verdade é `app/globals.css`. Este documento explica as decisões;
o CSS é quem manda.

## Paleta

| Papel | Token | Cor | Onde aparece |
|---|---|---|---|
| Fundo | `--bg` | `#f7fbfa` | corpo das páginas |
| Fundo alternado | `--bg-soft` | `#edf5f3` | seções em faixa |
| Superfície | `--card` | `#ffffff` | cartões, painéis |
| Separador | `--line` | `#d9e7e4` | divisórias decorativas |
| Borda de controle | `--line-forte` | `#699890` | alternativas, busca, botões-ícone |
| Texto | `--ink` | `#1e2f2d` | leitura corrida |
| Texto secundário | `--ink-soft` | `#5b6f6c` | apoio, metadados |
| Marca escura | `--brand-900` | `#0b3b38` | títulos, rodapé, barra lateral |
| Marca | `--brand-600` | `#0f766e` | ação primária, links |
| Marca clara | `--brand-500` | `#14a89b` | ponta dos gradientes |
| Marca tint | `--brand-50` | `#e0f0ec` | etiquetas, ícones |
| Acento | `--accent-600` | `#f0a323` | CTA secundário, filete da lei |
| Marca-texto | `--accent-300` | `#fbe3b4` | grifo no título, marca no escuro |
| Sucesso | `--success-700` | `#0b6f56` | acerto, "grátis" |
| Erro | `--danger-600` | `#b53d24` | alternativa errada |

## Tipografia

- **Outfit** — títulos. Geométrica e sem serifa: confiante, moderna, jovem sem
  ser infantil.
- **Inter** — interface e leitura corrida. Neutra, ótima em telas pequenas.
- **Lora** — **exclusiva para texto de lei**. A serifa separa a voz da lei da
  voz do professor e sustenta leitura longa. Não use Lora em nenhum outro lugar:
  a distinção é funcional, não decorativa.

## Regras

1. **Estado tem nome de estado.** `--danger-*` e `--success-*` só significam
   erro e acerto. Nunca use um deles como enfeite — na identidade anterior o
   coral era acento e erro ao mesmo tempo, e isso apagava o sinal.
2. **Sobre âmbar, texto escuro.** `--accent-600` não aceita texto branco
   (contraste 1.9:1). Use `--on-accent` (`#3a2a06`).
3. **Sobre superfície escura, a marca vira âmbar.** O verde da marca sobre
   `--brand-900` dá 2.26:1. O rodapé e a barra lateral trocam por `--accent-300`.
4. **Borda de controle é `--line-forte`.** O WCAG 1.4.11 exige 3:1 para limites
   de componentes interativos; `--line` (1.25:1) só serve para separador
   decorativo.

## Acessibilidade

O §9 exige **WCAG 2.1 AA**. `scripts/contraste.mjs` verifica os pares
efetivamente usados na interface:

```bash
npm run contraste
```

Os 16 pares passam. Ao mexer em qualquer cor, rode de novo antes de commitar.

## Onde a identidade vive

- `app/globals.css` — tokens e componentes (é também o CSS do `prototipo/`)
- `app/layout.tsx` — carregamento das três famílias tipográficas
- `scripts/contraste.mjs` — verificação de contraste
