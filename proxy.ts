import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  CABECALHO_PORTAL, CABECALHO_HOST_EXTERNO, CABECALHO_PROTO_EXTERNO,
  COOKIE_INDICACAO, mascaraDoHost,
} from './lib/portal.ts';

/**
 * Resolução de tenant pelo endereço — §5.10 do discovery.
 *
 * A partir do Next 16 este arquivo se chama `proxy.ts` (era
 * `middleware.ts`); a função é a mesma, o nome mudou. Ele roda antes da
 * aplicação, lê o Host e escreve a máscara do portal num cabeçalho que as
 * páginas leem em `lib/portal-consultas.ts`.
 *
 * Por que só isso, e nada de banco: a documentação do Next é explícita em
 * que proxy não é lugar de busca de dados nem de autorização. Aqui se lê
 * um cabeçalho e se escreve outro — a tradução de máscara em portal, que
 * precisa do banco, acontece na aplicação.
 *
 * A LINHA QUE IMPORTA é a que apaga o cabeçalho recebido. Sem ela,
 * qualquer pessoa mandaria `x-portal-mascara: jackson` numa requisição ao
 * site principal e leria o acervo de outro portal. O cabeçalho só vale
 * quando foi este arquivo que o escreveu.
 */
export function proxy(request: NextRequest) {
  const cabecalhos = new Headers(request.headers);

  // Nunca confiar no que veio da rua: só o que escrevemos aqui vale.
  cabecalhos.delete(CABECALHO_PORTAL);
  cabecalhos.delete(CABECALHO_HOST_EXTERNO);
  cabecalhos.delete(CABECALHO_PROTO_EXTERNO);

  const host = request.headers.get('host');
  const mascara = mascaraDoHost(host);
  if (mascara) cabecalhos.set(CABECALHO_PORTAL, mascara);

  // O endereço externo, para quem precisar montar URL de volta para o
  // navegador (o link rastreado /ir, por exemplo): daqui em diante a
  // aplicação só enxerga o host interno.
  if (host) cabecalhos.set(CABECALHO_HOST_EXTERNO, host);
  cabecalhos.set(CABECALHO_PROTO_EXTERNO,
    request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', ''));

  // §5.10.1 — o visitante chegou pelo nosso anúncio (/ir/<mascara>) com
  // ?i=<token>. O token vai para um cookie DESTE portal (o cookie é por
  // host, então não vaza para outro) e sai da URL, para não ser copiado
  // junto com o link. Quem o lê é o cadastro/login (acoes-auth.ts).
  const token = request.nextUrl.searchParams.get('i');
  if (mascara && token && /^[A-Za-z0-9_-]{16,64}$/.test(token)) {
    const limpa = request.nextUrl.clone();
    limpa.searchParams.delete('i');
    const resposta = NextResponse.redirect(limpa);
    resposta.cookies.set(COOKIE_INDICACAO, token, {
      httpOnly: true, sameSite: 'lax', path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 90 * 86_400,
    });
    return resposta;
  }

  return NextResponse.next({ request: { headers: cabecalhos } });
}

export const config = {
  /**
   * Tudo, menos o que não depende de portal: arquivos internos do Next,
   * mídia servida pelo nginx e os estáticos da raiz. Poupa uma passagem
   * por requisição de imagem, que é a maioria delas.
   */
  /**
   * `api/upload` fica de fora por um motivo que a documentação do Next 16
   * deixa claro: com proxy, o corpo da requisição é bufferizado em
   * memória (10 MB por padrão). Uma aula tem centenas de megabytes e
   * precisa fluir do socket para o disco. A rota não lê nenhum cabeçalho
   * que o proxy escreveria — decide por sessão e posse do portal.
   */
  matcher: [
    '/((?!_next/static|_next/image|midia-interna|api/upload|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|woff2?)$).*)',
  ],
};
