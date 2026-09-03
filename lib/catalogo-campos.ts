/**
 * A projeção da matéria — parte pura, sem `next/cache`.
 *
 * `catalogo.ts` embrulha as consultas no cache do Next, e por isso não
 * pode ser importado por teste em Node puro. O que é só SQL e tipo mora
 * aqui, para o catálogo E a vitrine compartilhada (`vitrine.ts`) lerem a
 * matéria com as mesmas colunas — uma projeção só, uma verdade só.
 */

export interface Materia {
  id: number; slug: string; nome: string; ementa: string;
  onda: number | null; status: string; professor: string | null;
  areaSlug: string; areaNome: string;
  aulasPublicadas: number; questoes: number; duracaoTotal: number;
  /** De quem é o curso (§5.10.2, etapa 5) e se ele está na nossa vitrine. */
  portalId: number; naVitrinePlataforma: boolean;
}

export const MATERIA_CAMPOS = `
  m.id, m.slug, m.nome, m.ementa, m.onda, m.status, m.professor,
  m.portal_id::int AS "portalId", m.na_vitrine_plataforma AS "naVitrinePlataforma",
  a.slug AS "areaSlug", a.nome AS "areaNome",
  (SELECT count(*)::int FROM aula au JOIN assunto s ON s.id = au.assunto_id
    WHERE s.materia_id = m.id AND au.status = 'publicado') AS "aulasPublicadas",
  (SELECT count(*)::int FROM questao q
     JOIN exercicio e ON e.id = q.exercicio_id
     JOIN aula au ON au.id = e.aula_id
     JOIN assunto s ON s.id = au.assunto_id
    WHERE s.materia_id = m.id AND au.status = 'publicado') AS "questoes",
  (SELECT coalesce(sum(au.duracao_segundos), 0)::int FROM aula au
     JOIN assunto s ON s.id = au.assunto_id
    WHERE s.materia_id = m.id AND au.status = 'publicado') AS "duracaoTotal"
`;
