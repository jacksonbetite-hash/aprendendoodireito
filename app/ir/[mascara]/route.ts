import { NextResponse } from 'next/server';
import { portalIdAtual, buscarPortalPorMascara } from '../../../lib/portal-consultas.ts';
import { criarIndicacao } from '../../../lib/portal-indicacao.ts';
import { dominioBase, CABECALHO_HOST_EXTERNO, CABECALHO_PROTO_EXTERNO } from '../../../lib/portal.ts';

/**
 * O link rastreado do §5.10.1: todo anúncio ou card de portal na nossa
 * vitrine aponta para /ir/<mascara>. O clique cria a indicação (com prazo
 * do contrato) e manda o visitante ao portal carregando o token — que o
 * proxy do portal guarda em cookie.
 *
 * Só existe no site principal: um portal indicando a si mesmo geraria
 * acréscimo sobre venda que foi esforço do próprio professor.
 */
export async function GET(req: Request, { params }: { params: Promise<{ mascara: string }> }) {
  if ((await portalIdAtual()) !== 0) return new NextResponse(null, { status: 404 });

  const { mascara } = await params;
  const portal = await buscarPortalPorMascara(mascara);
  if (!portal || portal.status !== 'ATIVO') return new NextResponse(null, { status: 404 });

  const origem = new URL(req.url);
  const canal = (origem.searchParams.get('canal') ?? 'VITRINE').toUpperCase();
  const { token } = await criarIndicacao(portal.id, canal);

  // Protocolo e porta de quem BATEU NA PORTA, não do que o Node escuta:
  // aqui dentro `Host` já virou o interno (:3000). O proxy, que viu o
  // endereço real, repassou-o nos cabeçalhos externos (lib/portal.ts).
  const host = req.headers.get(CABECALHO_HOST_EXTERNO) ?? req.headers.get('host') ?? origem.host;
  const porta = host.includes(':') ? host.slice(host.lastIndexOf(':')) : '';
  const protocolo = req.headers.get(CABECALHO_PROTO_EXTERNO)
    ?? req.headers.get('x-forwarded-proto') ?? origem.protocol.replace(':', '');
  const destino = `${protocolo}://${portal.mascara}.${dominioBase()}${porta}/?i=${token}`;
  return NextResponse.redirect(destino, 302);
}
