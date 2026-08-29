import { query, queryOne } from './db.ts';
import type { Espectador, Licenca, StatusConta } from './licenca.ts';

/**
 * Sessão do aluno.
 *
 * Autenticação real (e-mail+senha, magic link, Google, 2FA para admin —
 * §10) ainda não está implementada. Até lá, a sessão é resolvida por um
 * e-mail fixo em variável de ambiente, para que todas as telas já leiam
 * o aluno do banco e passem pelo mesmo `podeAcessar`. Trocar isto por
 * um cookie assinado não muda nenhuma outra camada.
 */
const EMAIL_DEMO = process.env.ALUNO_DEMO ?? 'ana@exemplo.com';

export interface Aluno {
  id: number; nome: string; email: string;
  statusConta: StatusConta; ultimoLoginEm: Date | null;
}

export async function alunoAtual(): Promise<Aluno | null> {
  return queryOne<Aluno>(
    `SELECT id, nome, email, status_conta AS "statusConta", ultimo_login_em AS "ultimoLoginEm"
       FROM usuario WHERE email = $1`,
    [EMAIL_DEMO],
  );
}

interface LinhaLicenca {
  id: number; escopo: Licenca['escopo']; materiaId: number | null;
  origem: Licenca['origem']; status: Licenca['status'];
  inicioEm: Date; fimEm: Date; cota: Licenca['cota'];
  materiaNome: string | null; campanhaNome: string | null;
}

export function licencasDo(usuarioId: number) {
  return query<LinhaLicenca>(
    `SELECT l.id, l.escopo, l.materia_id AS "materiaId", l.origem, l.status,
            l.inicio_em AS "inicioEm", l.fim_em AS "fimEm", l.cota,
            m.nome AS "materiaNome", c.nome AS "campanhaNome"
       FROM licenca l
       LEFT JOIN materia m ON m.id = l.materia_id
       LEFT JOIN campanha_promocional c ON c.id = l.campanha_id
      WHERE l.usuario_id = $1
      ORDER BY l.fim_em DESC`,
    [usuarioId],
  );
}

/** Monta o espectador que o motor de licenças (§6.3) consome. */
export async function espectadorAtual(): Promise<Espectador> {
  const aluno = await alunoAtual();
  if (!aluno) return { licencas: [] };
  const licencas = await licencasDo(aluno.id);
  return { usuarioId: aluno.id, statusConta: aluno.statusConta, licencas };
}

export interface ProgressoMateria {
  materiaSlug: string; materiaNome: string;
  aulasConcluidas: number; aulasTotal: number; percentual: number;
}

export function progressoPorMateria(usuarioId: number) {
  return query<ProgressoMateria>(
    `SELECT m.slug AS "materiaSlug", m.nome AS "materiaNome",
            count(*) FILTER (WHERE p.concluida)::int AS "aulasConcluidas",
            count(au.id)::int AS "aulasTotal",
            CASE WHEN count(au.id) = 0 THEN 0
                 ELSE round(100.0 * count(*) FILTER (WHERE p.concluida) / count(au.id))::int
            END AS percentual
       FROM materia m
       JOIN assunto s ON s.materia_id = m.id
       JOIN aula au ON au.assunto_id = s.id AND au.status = 'publicado'
       LEFT JOIN progresso_aula p ON p.aula_id = au.id AND p.usuario_id = $1
      WHERE EXISTS (SELECT 1 FROM licenca l WHERE l.usuario_id = $1
                      AND (l.escopo = 'CATALOGO' OR l.materia_id = m.id))
      GROUP BY m.slug, m.nome, m.ordem
      ORDER BY m.ordem`,
    [usuarioId],
  );
}

export function continuarDeOndeParou(usuarioId: number) {
  return queryOne<{
    slug: string; titulo: string; materiaNome: string;
    segundosAssistidos: number; duracaoSegundos: number;
  }>(
    `SELECT au.slug, au.titulo, m.nome AS "materiaNome",
            p.segundos_assistidos AS "segundosAssistidos",
            au.duracao_segundos AS "duracaoSegundos"
       FROM progresso_aula p
       JOIN aula au ON au.id = p.aula_id
       JOIN assunto s ON s.id = au.assunto_id
       JOIN materia m ON m.id = s.materia_id
      WHERE p.usuario_id = $1 AND NOT p.concluida
      ORDER BY p.atualizado_em DESC LIMIT 1`,
    [usuarioId],
  );
}

export async function estatisticas(usuarioId: number) {
  const linha = await queryOne<{ respondidas: number; acertos: number }>(
    `SELECT count(*)::int AS respondidas,
            count(*) FILTER (WHERE acertou)::int AS acertos
       FROM resposta WHERE usuario_id = $1`,
    [usuarioId],
  );
  const respondidas = linha?.respondidas ?? 0;
  const acertos = linha?.acertos ?? 0;
  return {
    respondidas, acertos,
    percentual: respondidas ? Math.round((acertos / respondidas) * 100) : 0,
  };
}

/** Caderno de erros (§5.2): questões erradas que ainda não foram refeitas. */
export function cadernoDeErros(usuarioId: number) {
  return query<{ questaoId: number; enunciado: string; aulaSlug: string; aulaTitulo: string }>(
    `SELECT DISTINCT ON (q.id) q.id AS "questaoId", q.enunciado,
            au.slug AS "aulaSlug", au.titulo AS "aulaTitulo"
       FROM resposta r
       JOIN questao q ON q.id = r.questao_id
       JOIN exercicio e ON e.id = q.exercicio_id
       JOIN aula au ON au.id = e.aula_id
      WHERE r.usuario_id = $1
        AND NOT EXISTS (
          SELECT 1 FROM resposta r2
           WHERE r2.usuario_id = r.usuario_id AND r2.questao_id = r.questao_id
             AND r2.acertou AND r2.respondida_em > r.respondida_em)
        AND NOT r.acertou
      ORDER BY q.id, r.respondida_em DESC`,
    [usuarioId],
  );
}
