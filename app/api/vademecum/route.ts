import { NextResponse } from 'next/server';
import { sugerirDispositivos } from '../../../lib/vademecum.ts';

/**
 * A lista que aparece embaixo da caixa de busca enquanto se digita (§5.4).
 *
 * É chamada a cada pausa na digitação, então responde curto: rótulo, norma
 * e um trecho. O texto inteiro do artigo fica para a página — mandar 40 mil
 * caracteres a cada tecla seria pagar caro por algo que não cabe na lista.
 *
 * A lei é pública e a consulta é livre (§5.4): não há sessão a verificar
 * aqui. O que a rota precisa é não virar uma torneira de banco aberta — daí
 * o teto no limite e o descarte do termo curto demais para significar algo.
 */
export async function GET(req: Request) {
  const termo = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (termo.length < 2) return NextResponse.json({ resultados: [] });

  const achados = await sugerirDispositivos(termo, 8);

  return NextResponse.json({
    resultados: achados.map((d) => ({
      id: d.id,
      rotulo: d.rotulo,
      norma: d.normaSigla,
      normaSlug: d.normaSlug,
      trecho: d.trecho,
    })),
  }, {
    // a lei muda de mês em mês, e a mesma busca se repete o dia inteiro
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}
