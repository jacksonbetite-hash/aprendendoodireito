import { NextResponse } from 'next/server';
import { registrarResposta } from '../../../lib/exercicio.ts';
import { alunoAtual } from '../../../lib/sessao.ts';

export async function POST(req: Request) {
  const aluno = await alunoAtual();
  if (!aluno) return NextResponse.json({ erro: 'sem sessão' }, { status: 401 });

  let corpo: { questaoId?: unknown; alternativaId?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: 'json inválido' }, { status: 400 });
  }

  const questaoId = Number(corpo.questaoId);
  const alternativaId = Number(corpo.alternativaId);
  if (!Number.isInteger(questaoId) || !Number.isInteger(alternativaId)) {
    return NextResponse.json({ erro: 'parâmetros inválidos' }, { status: 400 });
  }

  try {
    // registrarResposta valida que a alternativa pertence à questão —
    // sem isso daria para forjar acerto apontando alternativa de outra questão
    const { acertou } = await registrarResposta(aluno.id, questaoId, alternativaId);
    return NextResponse.json({ acertou });
  } catch {
    return NextResponse.json({ erro: 'alternativa não pertence à questão' }, { status: 400 });
  }
}
