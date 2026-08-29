import { query } from './db.ts';

export interface Alternativa {
  id: number; texto: string; correta: boolean; comentario: string;
}
export interface Questao {
  id: number; tipo: 'multipla_escolha' | 'certo_errado';
  enunciado: string; origem: string; alternativas: Alternativa[];
}

/**
 * Carrega o exercício de uma aula com TODOS os comentários (§5.3).
 * Os comentários vão para o cliente junto com as alternativas: o
 * discovery quer correção imediata, e esconder o gabarito atrás de outra
 * requisição só adicionaria latência a um conteúdo que o aluno já pagou.
 */
export async function exercicioDaAula(aulaId: number): Promise<Questao[]> {
  const linhas = await query<{
    questaoId: number; tipo: Questao['tipo']; enunciado: string; origem: string;
    altId: number; texto: string; correta: boolean; comentario: string;
  }>(
    `SELECT q.id AS "questaoId", q.tipo, q.enunciado, q.origem,
            a.id AS "altId", a.texto, a.correta, a.comentario
       FROM questao q
       JOIN exercicio e ON e.id = q.exercicio_id
       JOIN alternativa a ON a.questao_id = q.id
      WHERE e.aula_id = $1
      ORDER BY q.ordem, a.ordem`,
    [aulaId],
  );

  const porQuestao = new Map<number, Questao>();
  for (const l of linhas) {
    let q = porQuestao.get(l.questaoId);
    if (!q) {
      q = { id: l.questaoId, tipo: l.tipo, enunciado: l.enunciado, origem: l.origem, alternativas: [] };
      porQuestao.set(l.questaoId, q);
    }
    q.alternativas.push({ id: l.altId, texto: l.texto, correta: l.correta, comentario: l.comentario });
  }
  return [...porQuestao.values()];
}

export async function registrarResposta(
  usuarioId: number, questaoId: number, alternativaId: number,
): Promise<{ acertou: boolean }> {
  const [alt] = await query<{ correta: boolean }>(
    'SELECT correta FROM alternativa WHERE id = $1 AND questao_id = $2',
    [alternativaId, questaoId],
  );
  if (!alt) throw new Error('alternativa não pertence à questão');

  await query(
    `INSERT INTO resposta (usuario_id, questao_id, alternativa_id, acertou)
     VALUES ($1, $2, $3, $4)`,
    [usuarioId, questaoId, alternativaId, alt.correta],
  );
  return { acertou: alt.correta };
}
