# Locução e trilha do vídeo do hero

Cinco falas, uma por cena, mais uma música de fundo. O
`scripts/gerar-video-hero.mjs` monta tudo: coloca cada fala no instante que o
`narracao.json` indica e abaixa a música sob a voz.

| Arquivo | Entra em | Fala |
|---|---|---|
| `01.mp3` | 0,50 s | Aprimore o seu saber, no ritmo de quem trabalha. |
| `02.mp3` | 4,90 s | A aula é curta. Nenhuma passa de quinze minutos. |
| `03.mp3` | 9,42 s | O exercício vem em seguida, comentado um a um. |
| `04.mp3` | 13,48 s | E a fonte original está a um clique. |
| `05.mp3` | 16,96 s | Acompanhe o seu progresso. Sete dias grátis. |

## Procedência

**Voz.** Sintética, não é pessoa gravada: HeyGen, voz pública "Ana Carvalho -
Friendly" (`6c0a95599317428a8151293305deceba`), locale `pt-BR`, **velocidade
0,95**. Gerada em 01/09/2026. Os arquivos foram recortados no silêncio das
pontas e nivelados em −17 LUFS.

A velocidade 0,95 não é detalhe: leitura mais lenta soa menos robótica, e foi o
que se pediu ao trocar a versão anterior (que era 1,0×). Ao regerar, mantenha —
e note que ela **alonga cada fala em cerca de 12%**, que foi o motivo de o vídeo
passar de 18 s para 22 s.

Como é voz sintetizada de biblioteca pública, e não a voz de uma pessoa
identificável, não há cessão de uso de voz a resolver. Se um dia a locução virar
gravação de alguém de verdade, aí passa a haver — e o mesmo cuidado que
`public/retratos/LEIA-ME.md` descreve para as fotos vale aqui.

**Trilha** (`../trilha/fundo.mp3`). Catálogo de música do HeyGen, faixa gerada
por IA `17babe5317f24345b808eaf6f2b53e02` ("uplifting inspiring acoustic
corporate, light piano and soft strings"). Recortada nos primeiros 22 s,
nivelada em −30 LUFS com entrada e saída em fade.

> **Pendência de licença — resolver antes de publicar.** A faixa veio do catálogo
> do HeyGen, pensado para vídeos feitos e servidos por eles. Aqui ela é servida
> pelo próprio site, fora da plataforma deles, e isso **não foi conferido nos
> termos do HeyGen**. Antes de o site ir ao ar, ou essa permissão se confirma por
> escrito, ou a faixa é trocada por uma de biblioteca com licença comercial
> explícita. A voz não tem esse problema; só a música.

## Por que os arquivos ficam versionados

O gerador **não** chama o serviço de voz nem o de música. Se chamasse, cada
rodada de `npm run video` gastaria crédito da conta e a leitura sairia
ligeiramente diferente da anterior. Com os arquivos aqui, o vídeo é reproduzível
offline e sempre igual.

## Como a mistura é feita

A música não fica num volume fixo: o gerador usa `sidechaincompress` — o
*ducking* de rádio — para abaixá-la enquanto alguém fala e devolvê-la ao normal
no silêncio entre as cenas. É o que deixa a locução legível sem manter a trilha
baixa o tempo inteiro. Os parâmetros estão no `gerar-video-hero.mjs`.

## Para mudar o texto ou a voz

1. Gere as falas novas no serviço de voz. Para não trocar de locutor no meio,
   use a mesma voz e velocidade da seção de procedência.
2. Recorte o silêncio das pontas e nivele:
   `ffmpeg -ss <ini> -t <dur> -i bruto.mp3 -af "afade=t=in:st=0:d=0.04,afade=t=out:st=<dur-0.06>:d=0.06,loudnorm=I=-17:TP=-2:LRA=11" -ac 1 -ar 44100 -c:a libmp3lame -b:a 96k 0N.mp3`
3. Ajuste `inicio` e `texto` no `narracao.json` e rode `npm run video`.

**Cada fala tem de caber na sua cena, e mudar a fala pode obrigar a mexer nos
cortes.** Eles estão em `scripts/video-hero/cena.html`, na lista `CENAS`:

| Cena | Corte | Fala |
|---|---|---|
| abertura | 0,0 – 4,5 | 0,50 – 4,00 |
| aula | 4,3 – 9,0 | 4,90 – 8,52 |
| exercício | 8,8 – 13,1 | 9,42 – 12,58 |
| fonte | 12,9 – 16,6 | 13,48 – 16,06 |
| progresso | 16,4 – 22,0 | 16,96 – 20,78 |

A folga nas pontas existe para a voz não começar durante o fade de entrada nem
ser cortada pelo de saída. Mexeu numa, confira o resultado:

```
ffmpeg -v info -i public/video/apresentacao.mp4 -vn -af "silencedetect=n=-45dB:d=0.35" -f null -
```

Se mudar a duração total, mude também `DURACAO` no `cena.html` e a duração da
trilha — ela é recortada no tamanho do filme e não faz laço sozinha.

## O que o som não resolve

O vídeo começa mudo no hero, e continua assim para quase todo mundo: navegador
só toca som depois de um gesto do usuário, e o autoplay só existe porque o vídeo
está mudo. O botão de som em `app/VideoHero.tsx` é o único caminho para a
narração ser ouvida. Não conte com ela para transmitir nada que a página já não
diga por escrito.
