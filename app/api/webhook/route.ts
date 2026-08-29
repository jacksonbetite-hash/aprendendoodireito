import { NextResponse } from 'next/server';
import { provedorAtual } from '../../../lib/pagamento.ts';
import { confirmarPagamento } from '../../../lib/checkout.ts';

/**
 * Webhook do gateway (§8.3).
 *
 * Três garantias, nesta ordem:
 * 1. Assinatura conferida — sem isso, qualquer um libera licença de graça.
 * 2. Idempotência — o mesmo evento pode chegar duas vezes e nunca emite
 *    duas licenças (a guarda está em confirmarPagamento).
 * 3. Sempre 200 para evento já processado, para o gateway parar de
 *    reenviar; erro só quando há de fato algo a corrigir.
 */
export async function POST(req: Request) {
  const provedor = provedorAtual();
  const corpoBruto = await req.text();

  const assinatura = req.headers.get('x-assinatura') ?? req.headers.get('x-signature');
  if (!provedor.validarAssinatura(corpoBruto, assinatura)) {
    return NextResponse.json({ erro: 'assinatura inválida' }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = JSON.parse(corpoBruto);
  } catch {
    return NextResponse.json({ erro: 'json inválido' }, { status: 400 });
  }

  const evento = provedor.interpretarEvento(corpo);
  if (!evento) return NextResponse.json({ erro: 'evento não reconhecido' }, { status: 400 });

  const r = await confirmarPagamento(evento, provedor.nome, corpo);
  if (!r.ok) {
    // 200 de propósito: o gateway não deve reenviar um evento que já não
    // tem o que fazer. O motivo fica registrado em evento_gateway.
    return NextResponse.json({ processado: false, motivo: r.motivo });
  }
  return NextResponse.json({
    processado: true, licencaId: r.licencaId, jaProcessado: r.jaProcessado,
  });
}
