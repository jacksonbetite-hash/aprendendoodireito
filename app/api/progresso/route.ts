import { NextResponse } from 'next/server';
import { alunoAtual, registrarProgresso } from '../../../lib/sessao.ts';

/**
 * Onde o aluno parou na aula. Alimenta o "continuar de onde parou" do
 * painel (lib/sessao.ts) e o percentual por matéria.
 *
 * Chamada pelo PlayerAula a cada 15 s e ao fechar a aba — inclusive por
 * `navigator.sendBeacon`, que sempre manda POST e não espera resposta.
 * Por isso ela responde curto e nunca falha ruidosamente: um progresso
 * perdido custa alguns segundos de vídeo revisto, não vale um erro na
 * cara de quem está assistindo.
 */
export async function POST(req: Request) {
  const aluno = await alunoAtual();
  if (!aluno) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  let corpo: { aulaId?: unknown; segundos?: unknown; concluida?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: 'json inválido' }, { status: 400 });
  }

  const aulaId = Number(corpo.aulaId);
  const segundos = Number(corpo.segundos);
  if (!Number.isInteger(aulaId) || !Number.isInteger(segundos) || segundos < 0) {
    return NextResponse.json({ erro: 'parâmetros inválidos' }, { status: 400 });
  }

  // Nada de licença aqui de propósito: gravar que assistiu não abre nada.
  // Quem não tem licença não recebeu URL de vídeo para começo de conversa,
  // e forjar progresso só engana o próprio painel.
  await registrarProgresso(aluno.id, aulaId, segundos, corpo.concluida === true);
  return new NextResponse(null, { status: 204 });
}
