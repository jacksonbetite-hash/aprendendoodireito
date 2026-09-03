import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Entrega de vídeo — §10 do discovery.
 *
 * O problema que este módulo resolve: o arquivo da aula não pode ficar num
 * endereço público. Se ficar, a licença de §6.3 vira decoração — basta ler
 * o HTML para assistir sem pagar, e o link circula no WhatsApp.
 *
 * A solução tem duas metades, deliberadamente separadas:
 *
 *   1. AUTORIZAR (caro, uma vez por página): a página da aula já resolveu
 *      `podeAcessar`. Sabendo que libera, ela chama `urlDeReproducao` e
 *      embute no player um endereço assinado, com prazo e com o aluno
 *      dentro da assinatura.
 *
 *   2. ENTREGAR (barato, centenas de vezes por aula): quem serve os bytes
 *      só confere o HMAC. Não abre o banco, não resolve sessão, não pensa
 *      em licença. É por isso que essa metade pode um dia sair daqui e ir
 *      para um CDN sem que nada acima mude — é exatamente o que a
 *      autenticação por token de Bunny e Cloudflare faz.
 *
 * Sobre o que isso protege, e o que não protege: impede o link vazado de
 * funcionar fora do prazo, e impede assistir sem licença. NÃO impede o
 * aluno logado de baixar o próprio arquivo — nada impede, aliás, a não ser
 * DRM. Contra isso vale a marca d'água com o nome do aluno, que não trava
 * a cópia mas dá dono a ela (ver PlayerAula.tsx).
 */

export type ProvedorVideo = 'LOCAL' | 'BUNNY' | 'CLOUDFLARE';

export interface FonteVideo {
  provedor: ProvedorVideo;
  /** LOCAL: nome do arquivo no volume. Demais: identificador do fornecedor. */
  id: string;
}

/**
 * Seis horas. O prazo precisa cobrir uma aula assistida com pausas — o
 * aluno que sai para o almoço no meio não pode voltar para um vídeo
 * quebrado. Encurtar isso não aumenta a segurança de forma relevante
 * (quem quer copiar copia no primeiro minuto) e piora a experiência.
 */
const VALIDADE_PADRAO_S = 6 * 60 * 60;

/** Só o que é seguro virar nome de arquivo: sem barra, sem `..`, sem espaço. */
const ID_VALIDO = /^[a-z0-9][a-z0-9._-]{0,119}$/i;

export function idDeVideoValido(id: string): boolean {
  return ID_VALIDO.test(id) && !id.includes('..');
}

function segredo(): string {
  const s = process.env.VIDEO_SEGREDO;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    // Em produção não há padrão aceitável: um segredo conhecido é o mesmo
    // que não ter assinatura nenhuma.
    throw new Error('VIDEO_SEGREDO não definido — veja .env.example');
  }
  return 'segredo-de-video-de-desenvolvimento';
}

/**
 * Assinatura sobre (id, aluno, expiração). O aluno entra na conta de
 * propósito: dois alunos assistindo a mesma aula recebem tokens
 * diferentes, então um link vazado é rastreável até quem vazou.
 */
function assinar(id: string, usuarioId: number, expiraEm: number): string {
  return createHmac('sha256', segredo())
    .update(`v1|${id}|${usuarioId}|${expiraEm}`)
    .digest('base64url');
}

export interface TokenVideo {
  /** Epoch em segundos. Vai claro na URL; a assinatura é que o protege. */
  e: number;
  t: string;
}

export function assinarAcesso(
  id: string,
  usuarioId: number,
  { agora = Date.now(), validadeS = VALIDADE_PADRAO_S } = {},
): TokenVideo {
  const e = Math.floor(agora / 1000) + validadeS;
  return { e, t: assinar(id, usuarioId, e) };
}

export type ResultadoToken =
  | { ok: true; usuarioId: number }
  | { ok: false; motivo: 'MALFORMADO' | 'EXPIRADO' | 'ASSINATURA' };

export function conferirAcesso(
  id: string,
  parametros: { e: string | null; t: string | null; u: string | null },
  agora = Date.now(),
): ResultadoToken {
  const { e, t, u } = parametros;
  if (!e || !t || !u) return { ok: false, motivo: 'MALFORMADO' };

  const expiraEm = Number(e);
  const usuarioId = Number(u);
  if (!Number.isSafeInteger(expiraEm) || !Number.isSafeInteger(usuarioId) || usuarioId < 0) {
    return { ok: false, motivo: 'MALFORMADO' };
  }

  // A expiração é conferida antes da assinatura só para dar o motivo certo;
  // as duas precisam passar de qualquer forma.
  if (expiraEm * 1000 <= agora) return { ok: false, motivo: 'EXPIRADO' };

  const esperado = Buffer.from(assinar(id, usuarioId, expiraEm));
  const recebido = Buffer.from(t);
  // timingSafeEqual joga se os tamanhos diferem — comparar antes evita o
  // throw e não vaza nada: o tamanho da assinatura é constante e conhecido.
  if (esperado.length !== recebido.length) return { ok: false, motivo: 'ASSINATURA' };
  if (!timingSafeEqual(esperado, recebido)) return { ok: false, motivo: 'ASSINATURA' };

  return { ok: true, usuarioId };
}

/**
 * O endereço que vai para o `<video src>`. Calculado a cada carregamento
 * da página, nunca guardado.
 *
 * `usuarioId` 0 é o visitante não cadastrado — legítimo nas aulas de
 * amostra gratuita (§6.1), que abrem sem login.
 */
export function urlDeReproducao(
  fonte: FonteVideo,
  usuarioId: number,
  opcoes: { agora?: number; validadeS?: number } = {},
): string {
  if (!idDeVideoValido(fonte.id)) {
    throw new Error(`id de vídeo inválido: ${JSON.stringify(fonte.id)}`);
  }

  switch (fonte.provedor) {
    case 'LOCAL': {
      const { e, t } = assinarAcesso(fonte.id, usuarioId, opcoes);
      const q = new URLSearchParams({ e: String(e), u: String(usuarioId), t });
      return `/api/video/${encodeURIComponent(fonte.id)}?${q}`;
    }
    // Quando a banda da VPS apertar, é aqui que o CDN entra — e só aqui.
    // Bunny e Cloudflare assinam a URL com o mesmo desenho (caminho +
    // expiração + chave), então o resto do sistema não muda uma linha.
    case 'BUNNY':
    case 'CLOUDFLARE':
      throw new Error(
        `provedor ${fonte.provedor} ainda não implementado — ver docs/entrega-de-video.md`,
      );
  }
}

/**
 * O texto da marca d'água que o player sobrepõe ao vídeo.
 *
 * Precisa cumprir duas exigências que puxam para lados opostos:
 * identificar o aluno para quem for investigar um vazamento, e não
 * entregar dado pessoal a quem estiver assistindo por cima do ombro dele
 * — ou a quem receber a cópia vazada. Nome (que ele já mostra no
 * cabeçalho) mais o e-mail com o miolo escondido resolve os dois: quem
 * vazou se reconhece na hora, o resto do mundo não aprende o endereço
 * dele. CPF não entra aqui: identifica melhor e vaza muito pior.
 */
export function marcaDoAluno(nome: string, email: string): string {
  const arroba = email.lastIndexOf('@');
  if (arroba < 1) return nome;
  const usuario = email.slice(0, arroba);
  const dominio = email.slice(arroba);
  const visivel = usuario.slice(0, Math.min(2, usuario.length - 1)) || usuario[0];
  return `${nome} · ${visivel}${'•'.repeat(3)}${dominio}`;
}

/* ================================================================
   Faixa de bytes (Range) — o que faz a barra de progresso funcionar
   ================================================================

   Sem resposta 206, o navegador só toca do começo: arrastar a barra não
   funciona, e o Safari se recusa a tocar o vídeo. É a pegadinha clássica
   de servir mídia por rota de aplicação, e o motivo de esta função
   existir separada e testada.                                          */

export type Faixa =
  | { tipo: 'inteiro' }
  | { tipo: 'parcial'; inicio: number; fim: number }
  | { tipo: 'inaceitavel' };

export function faixaPedida(cabecalho: string | null, tamanho: number): Faixa {
  if (!cabecalho) return { tipo: 'inteiro' };

  // Só `bytes`, e só uma faixa. Multipart/byteranges é permitido pela RFC
  // 7233 e nenhum player de vídeo usa; ignorar é mais seguro que servir
  // errado, e a RFC autoriza responder o arquivo inteiro.
  const m = /^bytes=(\d*)-(\d*)$/.exec(cabecalho.trim());
  if (!m) return { tipo: 'inteiro' };

  const [, cruInicio, cruFim] = m;
  if (cruInicio === '' && cruFim === '') return { tipo: 'inteiro' };

  let inicio: number;
  let fim: number;

  if (cruInicio === '') {
    // `bytes=-500` — os últimos 500 bytes. O player usa isso para ler o
    // índice `moov` de MP4 gravado com o índice no fim do arquivo.
    const ultimos = Number(cruFim);
    if (!Number.isSafeInteger(ultimos) || ultimos <= 0) return { tipo: 'inaceitavel' };
    inicio = Math.max(0, tamanho - ultimos);
    fim = tamanho - 1;
  } else {
    inicio = Number(cruInicio);
    fim = cruFim === '' ? tamanho - 1 : Number(cruFim);
    if (!Number.isSafeInteger(inicio) || !Number.isSafeInteger(fim)) {
      return { tipo: 'inaceitavel' };
    }
    // Pedir além do fim é erro (416); pedir um fim grande demais, não —
    // a RFC manda truncar no último byte.
    if (inicio >= tamanho) return { tipo: 'inaceitavel' };
    fim = Math.min(fim, tamanho - 1);
    if (fim < inicio) return { tipo: 'inaceitavel' };
  }

  if (inicio === 0 && fim === tamanho - 1) return { tipo: 'inteiro' };
  return { tipo: 'parcial', inicio, fim };
}

const TIPOS: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.m3u8': 'application/vnd.apple.mpegurl',
  '.ts': 'video/mp2t',
  '.vtt': 'text/vtt; charset=utf-8',
};

export function tipoDoArquivo(nome: string): string {
  const ponto = nome.lastIndexOf('.');
  return (ponto >= 0 && TIPOS[nome.slice(ponto).toLowerCase()]) || 'application/octet-stream';
}
