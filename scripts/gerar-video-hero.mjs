/**
 * Gera o vídeo ilustrativo do hero da página inicial.
 *
 *   node scripts/gerar-video-hero.mjs
 *
 * Abre scripts/video-hero/cena.html no Chromium do Playwright, chama
 * desenhar(t) uma vez por quadro, tira a foto do quadro e joga a
 * sequência no ffmpeg. Saem dois arquivos em public/video/:
 *
 *   apresentacao.mp4    H.264 — o que todo navegador toca
 *   apresentacao.jpg    o pôster, exibido antes do vídeo carregar
 *
 * Só H.264: numa cena de degradê chapado o VP9 do mesmo tamanho de tela
 * saiu maior que o x264, então o segundo formato custava um arquivo a
 * mais para não economizar nada.
 *
 * O vídeo é material de divulgação desenhado aqui dentro, com a
 * identidade de docs/identidade-visual.md: não tem gente filmada e não
 * veio de banco de imagens. O que ele mostra é a interface da própria
 * plataforma, então quando a interface mudar de cara, este vídeo precisa
 * ser gerado de novo.
 *
 * A locução (voz sintética) e a trilha de fundo vêm de arquivos gravados
 * em scripts/video-hero/narracao/ e .../trilha/. A procedência de cada
 * um, e o que ainda falta conferir na licença da música, estão no
 * LEIA-ME de scripts/video-hero/narracao/.
 *
 * Os arquivos gerados ficam versionados. O script é a fonte deles, e não
 * roda no build: quem mexer na cena roda à mão e comete o resultado.
 *
 * Precisa de ffmpeg no PATH (ou em FFMPEG) e do Chromium do Playwright
 * (ou de um navegador em CHROMIUM).
 */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir, rm, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const RAIZ = path.resolve(import.meta.dirname, '..');
const CENA = path.join(RAIZ, 'scripts', 'video-hero', 'cena.html');
const NARRACAO = path.join(RAIZ, 'scripts', 'video-hero', 'narracao');
const DESTINO = path.join(RAIZ, 'public', 'video');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

/* 4:3 para casar com o aspect-ratio da .hero-figura, em 2x do tamanho que
   a figura ocupa no desktop — o suficiente para tela retina sem inflar o
   arquivo. Dimensões pares, exigência do H.264. */
const L = 1280, A = 960, FPS = 30;
/* Quadro que vira pôster: a tela da aula já montada, com a barra andada.
   Tem de cair dentro da cena da aula — ver a lista CENAS em cena.html. */
const T_POSTER = 7.5;

const log = (m) => console.log(m);

/** Roda um processo e resolve com o código de saída. */
function executar(cmd, args, { entrada } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: [entrada ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    let erro = '';
    p.stderr.on('data', (d) => { erro += d; });
    p.on('error', reject);
    p.on('close', (codigo) => {
      if (codigo === 0) return resolve();
      reject(new Error(`${cmd} saiu com ${codigo}\n${erro.slice(-4000)}`));
    });
    if (entrada) entrada(p.stdin);
  });
}

/* ---------- 1. abre a cena ---------- */
/* Só os dois arquivos gerados saem daqui: a pasta também guarda o
   LEIA-ME com a procedência, que não é para ser apagado. */
await mkdir(DESTINO, { recursive: true });
for (const f of ['apresentacao.mp4', 'apresentacao.jpg']) {
  await rm(path.join(DESTINO, f), { force: true });
}

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const contexto = await navegador.newContext({
  viewport: { width: L, height: A },
  deviceScaleFactor: 1,
  reducedMotion: 'no-preference',
});
const pagina = await contexto.newPage();
await pagina.goto(pathToFileURL(CENA).href, { waitUntil: 'load' });

/* A Lexend vem do Google Fonts. Sem rede, a cena cai no system-ui e o
   vídeo sai fora da identidade — melhor avisar do que entregar calado. */
const temLexend = await pagina.evaluate(async () => {
  try { await document.fonts.load('800 74px Lexend'); await document.fonts.ready; } catch { /* offline */ }
  return document.fonts.check('800 74px Lexend');
});
if (!temLexend) {
  console.warn('! Lexend não carregou (sem rede?) — o vídeo sairá com a fonte do sistema.');
}

const duracao = await pagina.evaluate(() => window.DURACAO);
const quadros = Math.round(duracao * FPS);

/* ---------- 2. quadro a quadro para dentro do ffmpeg ---------- */
const mp4 = path.join(DESTINO, 'apresentacao.mp4');

/* ---------- 2a. a locução e a trilha ----------
   As falas e a música são arquivos gravados no repositório: as falas uma
   por cena, colocadas no instante que narracao.json diz. Vieram de
   serviços que este script NÃO chama: se ele chamasse, cada geração do
   vídeo gastaria crédito e a leitura sairia ligeiramente diferente da
   anterior. Para trocar, veja scripts/video-hero/narracao/LEIA-ME.md. */
const roteiro = JSON.parse(await readFile(path.join(NARRACAO, 'narracao.json'), 'utf8'));
const falas = roteiro.falas;
const trilha = roteiro.trilha ? path.resolve(NARRACAO, roteiro.trilha.arquivo) : null;

/* Cada fala entra atrasada até o seu instante; amix soma as cinco numa
   trilha só. normalize=0 porque elas não se sobrepõem — sem isso o amix
   divide o volume pelo número de entradas e a voz sai abafada. */
const entradasAudio = [
  ...falas.flatMap((f) => ['-i', path.join(NARRACAO, f.arquivo)]),
  ...(trilha ? ['-i', trilha] : []),
];
const iTrilha = falas.length + 1;                 // 0 é o vídeo; as falas vêm antes

const misturaVoz =
  falas.map((f, i) => `[${i + 1}:a]adelay=${Math.round(f.inicio * 1000)}:all=1[v${i}]`).join(';') +
  ';' + falas.map((_, i) => `[v${i}]`).join('') +
  `amix=inputs=${falas.length}:normalize=0:dropout_transition=0[voz]`;

/* Sem trilha, a voz já é a mistura final. Com trilha, a música abaixa
   sozinha enquanto alguém fala (sidechaincompress, o "ducking" de rádio)
   e volta ao normal no silêncio entre as cenas — é isso que deixa a
   locução legível por cima da música sem baixar tudo o tempo todo.
   O asplit existe porque a voz é usada duas vezes: uma para disparar a
   compressão da música, outra para entrar na soma final. */
const grafo = trilha
  ? misturaVoz +
    ';[voz]asplit=2[voz1][gatilho]' +
    `;[${iTrilha}:a]aformat=channel_layouts=mono[mus]` +
    ';[mus][gatilho]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=450:makeup=1[musbaixa]' +
    ';[musbaixa][voz1]amix=inputs=2:normalize=0:dropout_transition=0[audio]'
  : misturaVoz + ';[voz]anull[audio]';

log(
  `Renderizando ${quadros} quadros (${duracao}s a ${FPS} fps, ${L}x${A})` +
  ` com ${falas.length} falas${trilha ? ' e trilha' : ''}…`,
);

await executar(FFMPEG, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-i', 'pipe:0',
  ...entradasAudio,
  '-filter_complex', grafo,
  '-map', '0:v', '-map', '[audio]',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
  // yuv420p e faststart: o primeiro é o que Safari e celular exigem para
  // tocar; o segundo põe o índice na frente, para começar sem baixar tudo.
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  '-c:a', 'aac', '-b:a', '128k', '-ac', '1',
  // O vídeo manda na duração: sem isto o arquivo terminaria junto com a
  // última fala, e o laço cortaria o fim da cena.
  '-t', String(duracao), mp4,
], {
  entrada: async (stdin) => {
    for (let i = 0; i < quadros; i++) {
      await pagina.evaluate((t) => window.desenhar(t), i / FPS);
      const png = await pagina.screenshot({ type: 'png' });
      if (!stdin.write(png)) await new Promise((r) => stdin.once('drain', r));
      if (i % 60 === 0) log(`  quadro ${i}/${quadros}`);
    }
    stdin.end();
  },
});

/* ---------- 3. pôster ---------- */
await pagina.evaluate((t) => window.desenhar(t), T_POSTER);
await pagina.screenshot({ path: path.join(DESTINO, 'apresentacao.jpg'), type: 'jpeg', quality: 82 });

await navegador.close();
log('Pronto: public/video/apresentacao.{mp4,jpg}');
