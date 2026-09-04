import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import path from 'node:path';
import { idDeImagemValido, tipoMime, extensaoAceita } from '../../../../lib/upload.ts';

/**
 * Imagens enviadas pelo painel (foto de apresentação do portal). São
 * públicas — aparecem na página do portal para qualquer visitante —, então
 * não há assinatura: só a validação do id, que é o que impede ler fora do
 * diretório de imagens.
 */
export const dynamic = 'force-dynamic';

const RAIZ = path.resolve(
  /*turbopackIgnore: true*/ process.env.IMAGEM_RAIZ
    ?? path.join(path.dirname(process.env.VIDEO_RAIZ ?? './midia/video'), 'imagem'),
);

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!idDeImagemValido(id)) return new Response('id inválido', { status: 400 });
  const ext = extensaoAceita('imagem', id);
  if (!ext) return new Response('não encontrado', { status: 404 });

  const caminho = path.resolve(RAIZ, id);
  if (caminho !== path.join(RAIZ, id)) return new Response('id inválido', { status: 400 });

  let tamanho: number;
  try {
    const info = await stat(/*turbopackIgnore: true*/ caminho);
    if (!info.isFile()) return new Response('não encontrado', { status: 404 });
    tamanho = info.size;
  } catch {
    return new Response('não encontrado', { status: 404 });
  }

  const leitura = createReadStream(/*turbopackIgnore: true*/ caminho);
  return new Response(Readable.toWeb(leitura) as ReadableStream, {
    status: 200,
    headers: {
      'Content-Type': tipoMime('imagem', ext),
      'Content-Length': String(tamanho),
      // O nome tem sufixo aleatório: trocar a foto muda a URL, então o
      // cache pode ser longo sem servir foto velha.
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
