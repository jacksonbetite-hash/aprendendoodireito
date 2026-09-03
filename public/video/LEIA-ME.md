# Vídeo do hero — procedência e como regerar

Peça de divulgação da plataforma, exibida em laço na figura do hero da página
inicial (`app/VideoHero.tsx`). Vinte e dois segundos, com locução em português e
trilha de fundo.

**Ele começa mudo, e para quase todo mundo continua assim.** Navegador só toca
som depois de um gesto do usuário, e o autoplay do laço só existe porque o vídeo
está mudo. A narração só é ouvida por quem apertar o botão de som na figura.
Nada que ela diz pode ser informação que a página não dê por escrito.

| Arquivo | O que é |
|---|---|
| `apresentacao.mp4` | o vídeo, H.264 + AAC, 1280×960 (4:3), 30 fps, ~1,5 MB |
| `apresentacao.jpg` | o pôster, mostrado antes do vídeo carregar e quando o navegador recusa o autoplay |

## De onde vem

Dos arquivos deste repositório, e de mais nada. A animação está em
`scripts/video-hero/cena.html` — telas da própria plataforma desenhadas em HTML
com a paleta e a tipografia de `docs/identidade-visual.md` — e
`scripts/gerar-video-hero.mjs` fotografa a cena quadro a quadro no Chromium e
monta o arquivo com o ffmpeg.

A locução são cinco arquivos em `scripts/video-hero/narracao/`, um por cena, de
voz sintética, e a trilha de fundo está em `scripts/video-hero/trilha/`. A
procedência dos dois, e como trocar o texto, estão no LEIA-ME da pasta narracao.
O gerador não chama serviço nenhum: lê os arquivos gravados, para cada rodada
sair igual e não gastar crédito.

**A licença da trilha ainda não está resolvida** — a música veio do catálogo do
HeyGen e servi-la do próprio site é uso fora da plataforma deles. Está explicado
no LEIA-ME da narracao, e precisa ser fechado antes de publicar.

```
npm run video     # regera apresentacao.mp4 e apresentacao.jpg
```

Leva uns doze a dezoito minutos e imprime o número do quadro pelo caminho: são 660
fotos de tela, uma por quadro, e é a captura — não o ffmpeg — que demora. Não
travou.

Precisa do ffmpeg no `PATH` (ou em `FFMPEG`) e do Chromium do Playwright (ou de
um navegador em `CHROMIUM`). A cena busca a Lexend no Google Fonts; sem rede o
script avisa e o vídeo sai com a fonte do sistema — nesse caso, jogue fora e
regere com rede.

Não roda no build, de propósito: exige navegador e ffmpeg, que a imagem de
produção não tem. Quem mexer na cena roda à mão e comete os dois arquivos.

## O que ele mostra, e por que não leva selo

Cinco cenas: a marca, a tela da aula, o exercício comentado, o texto do art. 1º,
III da Constituição na biblioteca e o painel de progresso. A narração é voz
sintetizada de biblioteca pública, não a voz de uma pessoa identificável — não
há cessão de uso de voz a resolver. Os números do painel
(78% da trilha, 86/64/41% por área) e a questão são exemplos montados para a
peça, do mesmo jeito que um anúncio mostra a tela do produto preenchida.

Os retratos e os depoimentos da página inicial levam o selo
`.selo-ilustrativo` porque simulam pessoas reais dizendo coisas reais. Aqui não
há ninguém retratado, nem fala atribuída a ninguém, nem imagem de terceiro: só
a interface do produto. Nada a licenciar, nada a autorizar.

**O que precisa continuar verdadeiro.** O vídeo promete aula curta, exercício
comentado na sequência, fonte original e progresso por área, e fecha com "teste
grátis por 7 dias". Se qualquer uma dessas quatro coisas sair do produto, ou se
o teste grátis mudar de prazo, a cena **e a narração** têm de mudar junto —
senão vira promessa que a plataforma não cumpre. A locução repete as quatro
promessas em voz alta, então esquecer dela é deixar a mentira no ar depois de
corrigir a imagem.
