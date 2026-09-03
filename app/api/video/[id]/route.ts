import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import {
  conferirAcesso, idDeVideoValido, faixaPedida, tipoDoArquivo,
} from '../../../../lib/video.ts';
import { contabilizarTrafego } from '../../../../lib/portal-financeiro.ts';

/**
 * Entrega os bytes da aula — a metade barata de lib/video.ts.
 *
 * Esta rota NÃO abre o banco e NÃO resolve sessão. Ela confere um HMAC e
 * serve o arquivo. Isso é de propósito: é o caminho que roda centenas de
 * vezes por aula assistida, e é o que um dia sai daqui para um CDN. Quem
 * decide se o aluno pode assistir é a página da aula, uma vez, antes de
 * assinar a URL.
 *
 * Dois modos de servir, escolhidos por VIDEO_ACCEL_REDIRECT:
 *
 *   sem a variável (desenvolvimento) — o Node lê o arquivo e responde.
 *     Simples, funciona no `next dev`, e aguenta bem os poucos
 *     espectadores simultâneos de uma máquina de trabalho.
 *
 *   com a variável (VPS) — o Node responde 200 com o cabeçalho
 *     `X-Accel-Redirect` e corpo vazio; o nginx intercepta e entrega o
 *     arquivo com sendfile(). O Node decide, o nginx transporta. Sem
 *     isso, centenas de megabytes atravessariam o event loop do Node
 *     para nada.
 */

export const dynamic = 'force-dynamic';

/* Os `turbopackIgnore` abaixo desligam a análise estática de acesso a
   disco. Sem eles o Turbopack conclui que este arquivo pode ler qualquer
   coisa e arrasta o projeto INTEIRO para dentro de .next/standalone —
   prototipo, testes, public, tudo — o que briga com o `output: 'standalone'`
   enxuto de next.config.ts e com a imagem Docker.

   Desligar é seguro aqui porque o caminho não é estático por natureza: ele
   aponta para um volume que nem existe no momento do build. Quem valida o
   que pode ser lido é o par idDeVideoValido + a conferência de prefixo mais
   abaixo, em tempo de execução. */
const RAIZ = path.resolve(/*turbopackIgnore: true*/ process.env.VIDEO_RAIZ ?? './midia/video');
const ACCEL = process.env.VIDEO_ACCEL_REDIRECT;

const recusa = (status: number, motivo: string) =>
  new Response(motivo, { status, headers: { 'Cache-Control': 'no-store' } });

async function servir(req: Request, ctx: RouteContext<'/api/video/[id]'>, comCorpo: boolean) {
  const { id } = await ctx.params;

  // Antes de qualquer coisa: o id vira nome de arquivo, então nada de
  // barra nem `..`. É a diferença entre servir uma aula e servir o /etc.
  if (!idDeVideoValido(id)) return recusa(400, 'id inválido');

  const url = new URL(req.url);
  const conferencia = conferirAcesso(id, {
    e: url.searchParams.get('e'),
    u: url.searchParams.get('u'),
    t: url.searchParams.get('t'),
  });

  if (!conferencia.ok) {
    // 403 em vez de 404 quando o token só venceu: o player sabe que basta
    // recarregar a página para pegar um endereço novo.
    const status = conferencia.motivo === 'EXPIRADO' ? 403 : 401;
    return recusa(status, conferencia.motivo.toLowerCase());
  }

  // path.resolve + prefixo é o cinto além do suspensório do idDeVideoValido:
  // se a validação acima algum dia afrouxar, isto ainda segura.
  const caminho = path.resolve(RAIZ, id);
  if (caminho !== path.join(RAIZ, id)) return recusa(400, 'id inválido');

  let tamanho: number;
  try {
    const info = await stat(/*turbopackIgnore: true*/ caminho);
    if (!info.isFile()) return recusa(404, 'não encontrado');
    tamanho = info.size;
  } catch {
    return recusa(404, 'não encontrado');
  }

  const comuns: Record<string, string> = {
    'Content-Type': tipoDoArquivo(id),
    'Accept-Ranges': 'bytes',
    // O endereço é assinado e pessoal: cache compartilhado nunca; o cache
    // do próprio navegador ajuda a não rebaixar o mesmo trecho duas vezes.
    'Cache-Control': 'private, max-age=3600',
    'Content-Disposition': 'inline',
    // O arquivo não é para ser embutido em site alheio.
    'Cross-Origin-Resource-Policy': 'same-origin',
  };

  const faixa = faixaPedida(req.headers.get('range'), tamanho);

  if (faixa.tipo === 'inaceitavel') {
    return new Response(null, {
      status: 416,
      headers: { ...comuns, 'Content-Range': `bytes */${tamanho}` },
    });
  }

  const inicio = faixa.tipo === 'parcial' ? faixa.inicio : 0;
  const fim = faixa.tipo === 'parcial' ? faixa.fim : tamanho - 1;
  const parcial = faixa.tipo === 'parcial';

  // §5.10 — banda é insumo da fatura do portal. Conta-se a faixa PEDIDA
  // (o nginx do modo VPS refaz o Range, mas o tamanho é este); HEAD não
  // conta. Sem await: contabilidade nunca atrasa o vídeo.
  if (comCorpo) void contabilizarTrafego(id, fim - inicio + 1);

  const cabecalhos: Record<string, string> = {
    ...comuns,
    'Content-Length': String(fim - inicio + 1),
  };
  if (parcial) cabecalhos['Content-Range'] = `bytes ${inicio}-${fim}/${tamanho}`;

  // ---- Modo VPS: quem transporta é o nginx ----
  if (ACCEL) {
    // O nginx refaz a conta de Range sozinho na location interna, então
    // aqui só apontamos o arquivo e devolvemos o tipo. Mandar
    // Content-Length/Range junto brigaria com o que ele vai calcular.
    return new Response(null, {
      status: 200,
      headers: {
        'X-Accel-Redirect': `${ACCEL}/${encodeURIComponent(id)}`,
        'Content-Type': comuns['Content-Type'],
        'Cache-Control': comuns['Cache-Control'],
        'Content-Disposition': 'inline',
      },
    });
  }

  // ---- Modo desenvolvimento: o Node lê e responde ----
  if (!comCorpo) return new Response(null, { status: parcial ? 206 : 200, headers: cabecalhos });

  const leitura = createReadStream(/*turbopackIgnore: true*/ caminho, { start: inicio, end: fim });
  // O aluno que arrasta a barra abandona a leitura anterior; sem isso os
  // descritores de arquivo ficariam abertos até o processo morrer.
  req.signal?.addEventListener('abort', () => leitura.destroy(), { once: true });

  return new Response(Readable.toWeb(leitura) as ReadableStream, {
    status: parcial ? 206 : 200,
    headers: cabecalhos,
  });
}

export function GET(req: Request, ctx: RouteContext<'/api/video/[id]'>) {
  return servir(req, ctx, true);
}

/** O Safari pergunta o tamanho por HEAD antes de pedir o primeiro trecho. */
export function HEAD(req: Request, ctx: RouteContext<'/api/video/[id]'>) {
  return servir(req, ctx, false);
}
